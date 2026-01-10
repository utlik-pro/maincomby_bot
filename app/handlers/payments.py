"""
Telegram Stars payment handlers for subscription purchases.
"""
from datetime import datetime, timedelta
from aiogram import Router, Bot, F
from aiogram.types import (
    Message,
    CallbackQuery,
    PreCheckoutQuery,
    LabeledPrice,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)
from aiogram.filters import Command
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import User, Payment

router = Router()

# Global session factory
_session_factory = None


def set_session_factory(factory):
    """Set the session factory."""
    global _session_factory
    _session_factory = factory


def get_session() -> AsyncSession:
    """Get database session."""
    if _session_factory is None:
        raise RuntimeError("Session factory not initialized. Call set_session_factory() first.")
    return _session_factory()

# Subscription prices in Telegram Stars
SUBSCRIPTION_PRICES = {
    'light_week': {
        'stars': 15,
        'days': 7,
        'tier': 'light',
        'title': 'Light на неделю',
        'description': '20 свайпов в день, возможность писать матчам (7 дней)',
    },
    'light': {
        'stars': 50,
        'days': 30,
        'tier': 'light',
        'title': 'Light на месяц',
        'description': '20 свайпов в день, возможность писать матчам (30 дней)',
    },
    'pro_week': {
        'stars': 60,
        'days': 7,
        'tier': 'pro',
        'title': 'PRO на неделю',
        'description': 'Безлимитные свайпы, все премиум функции (7 дней)',
    },
    'pro': {
        'stars': 200,
        'days': 30,
        'tier': 'pro',
        'title': 'PRO на месяц',
        'description': 'Безлимитные свайпы, все премиум функции (30 дней)',
    },
}


async def get_user_by_tg_id(tg_user_id: int) -> User | None:
    """Get user from database by Telegram user ID."""
    async with get_session() as session:
        result = await session.execute(
            select(User).where(User.tg_user_id == tg_user_id)
        )
        return result.scalar_one_or_none()


def get_subscription_keyboard() -> InlineKeyboardMarkup:
    """Create subscription selection keyboard."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            # Light options
            [
                InlineKeyboardButton(
                    text=f"💚 Light неделя — {SUBSCRIPTION_PRICES['light_week']['stars']}⭐",
                    callback_data="buy_light_week"
                ),
                InlineKeyboardButton(
                    text=f"💚 Light месяц — {SUBSCRIPTION_PRICES['light']['stars']}⭐",
                    callback_data="buy_light"
                ),
            ],
            # PRO options
            [
                InlineKeyboardButton(
                    text=f"👑 PRO неделя — {SUBSCRIPTION_PRICES['pro_week']['stars']}⭐",
                    callback_data="buy_pro_week"
                ),
                InlineKeyboardButton(
                    text=f"👑 PRO месяц — {SUBSCRIPTION_PRICES['pro']['stars']}⭐",
                    callback_data="buy_pro"
                ),
            ],
            [
                InlineKeyboardButton(
                    text="Отмена",
                    callback_data="cancel_subscription"
                )
            ],
        ]
    )


def get_subscription_text() -> str:
    """Get subscription info text."""
    return (
        "💎 <b>Выберите подписку</b>\n\n"
        "<b>💚 Light</b>\n"
        "• 20 свайпов в день\n"
        "• Возможность писать матчам\n"
        f"  ├ Неделя: {SUBSCRIPTION_PRICES['light_week']['stars']}⭐\n"
        f"  └ Месяц: {SUBSCRIPTION_PRICES['light']['stars']}⭐\n\n"
        "<b>👑 PRO</b>\n"
        "• Безлимитные свайпы\n"
        "• Все функции Light\n"
        "• Приоритет в ленте\n"
        f"  ├ Неделя: {SUBSCRIPTION_PRICES['pro_week']['stars']}⭐\n"
        f"  └ Месяц: {SUBSCRIPTION_PRICES['pro']['stars']}⭐"
    )


@router.message(Command("subscribe"))
async def cmd_subscribe(message: Message):
    """Show subscription options."""
    await message.answer(get_subscription_text(), reply_markup=get_subscription_keyboard(), parse_mode="HTML")


@router.callback_query(F.data == "show_subscriptions")
async def callback_show_subscriptions(callback: CallbackQuery):
    """Show subscription options from callback."""
    await callback.message.edit_text(get_subscription_text(), reply_markup=get_subscription_keyboard(), parse_mode="HTML")
    await callback.answer()


@router.callback_query(F.data == "cancel_subscription")
async def callback_cancel_subscription(callback: CallbackQuery):
    """Cancel subscription selection."""
    await callback.message.edit_text("Выбор подписки отменён.")
    await callback.answer()


@router.callback_query(F.data.startswith("buy_"))
async def callback_buy_subscription(callback: CallbackQuery, bot: Bot):
    """Send invoice for subscription purchase."""
    subscription_type = callback.data.replace("buy_", "")

    if subscription_type not in SUBSCRIPTION_PRICES:
        await callback.answer("Неизвестный тип подписки", show_alert=True)
        return

    sub_info = SUBSCRIPTION_PRICES[subscription_type]

    # Create invoice
    prices = [LabeledPrice(label=sub_info['title'], amount=sub_info['stars'])]

    try:
        await bot.send_invoice(
            chat_id=callback.from_user.id,
            title=sub_info['title'],
            description=sub_info['description'],
            payload=f"subscription_{subscription_type}",
            currency="XTR",  # Telegram Stars currency
            prices=prices,
        )
        await callback.answer()
    except Exception as e:
        logger.error(f"Error sending invoice: {e}")
        await callback.answer("Ошибка при создании платежа. Попробуйте позже.", show_alert=True)


@router.pre_checkout_query()
async def pre_checkout_handler(pre_checkout: PreCheckoutQuery):
    """Handle pre-checkout query - validate payment."""
    # Always approve for now (Stars payments are always valid)
    await pre_checkout.answer(ok=True)


@router.message(F.successful_payment)
async def successful_payment_handler(message: Message, bot: Bot):
    """Handle successful payment - activate subscription."""
    payment = message.successful_payment

    # Parse payload
    payload = payment.invoice_payload  # e.g., "subscription_pro"
    subscription_type = payload.replace("subscription_", "")

    if subscription_type not in SUBSCRIPTION_PRICES:
        logger.error(f"Unknown subscription type in payload: {payload}")
        await message.answer("Ошибка при активации подписки. Обратитесь в поддержку.")
        return

    sub_info = SUBSCRIPTION_PRICES[subscription_type]
    tg_user_id = message.from_user.id

    try:
        async with get_session() as session:
            # Get user
            result = await session.execute(
                select(User).where(User.tg_user_id == tg_user_id)
            )
            user = result.scalar_one_or_none()

            if not user:
                logger.error(f"User not found for payment: tg_user_id={tg_user_id}")
                await message.answer("Ошибка: пользователь не найден. Обратитесь в поддержку.")
                return

            # Calculate expiration date
            # If user already has active subscription, extend it
            now = datetime.utcnow()
            if user.subscription_expires_at and user.subscription_expires_at > now:
                # Extend from current expiration
                new_expires = user.subscription_expires_at + timedelta(days=sub_info['days'])
            else:
                # Start from now
                new_expires = now + timedelta(days=sub_info['days'])

            # Update user subscription
            # Use tier from config (light_week -> light, pro_week -> pro)
            actual_tier = sub_info.get('tier', subscription_type)
            user.subscription_tier = actual_tier
            user.subscription_expires_at = new_expires

            # Record payment
            payment_record = Payment(
                user_id=user.id,
                amount_stars=payment.total_amount,
                subscription_type=actual_tier,
                telegram_payment_charge_id=payment.telegram_payment_charge_id,
                provider_payment_charge_id=payment.provider_payment_charge_id,
            )
            session.add(payment_record)

            await session.commit()

            logger.info(
                f"Subscription activated: user_id={user.id}, "
                f"tier={subscription_type}, expires={new_expires}"
            )

        # Send confirmation
        expires_str = new_expires.strftime("%d.%m.%Y")
        await message.answer(
            f"🎉 <b>Подписка активирована!</b>\n\n"
            f"Тариф: <b>{sub_info['title']}</b>\n"
            f"Действует до: <b>{expires_str}</b>\n\n"
            f"Спасибо за поддержку MAIN Community!",
            parse_mode="HTML"
        )

        # Sync to Supabase (import here to avoid circular imports)
        try:
            from app.services.supabase_sync import sync_service
            if sync_service:
                async with get_session() as session:
                    result = await session.execute(
                        select(User).where(User.tg_user_id == tg_user_id)
                    )
                    user = result.scalar_one_or_none()
                    if user:
                        await sync_service.sync_user(user)
        except Exception as e:
            logger.warning(f"Failed to sync subscription to Supabase: {e}")

    except Exception as e:
        logger.exception(f"Error processing payment: {e}")
        await message.answer(
            "Произошла ошибка при активации подписки. "
            "Ваш платёж получен, обратитесь в поддержку для активации."
        )


@router.message(Command("my_subscription"))
async def cmd_my_subscription(message: Message):
    """Show user's current subscription status."""
    user = await get_user_by_tg_id(message.from_user.id)

    if not user:
        await message.answer("Вы ещё не зарегистрированы. Откройте приложение.")
        return

    tier = user.subscription_tier or 'free'
    expires_at = user.subscription_expires_at

    if tier == 'free':
        text = (
            "📊 <b>Ваша подписка</b>\n\n"
            "Тариф: <b>Free</b>\n\n"
            "Хотите больше возможностей? Оформите подписку!"
        )
        keyboard = get_subscription_keyboard()
    else:
        now = datetime.utcnow()
        if expires_at and expires_at > now:
            days_left = (expires_at - now).days
            expires_str = expires_at.strftime("%d.%m.%Y")
            text = (
                f"📊 <b>Ваша подписка</b>\n\n"
                f"Тариф: <b>{tier.upper()}</b>\n"
                f"Действует до: <b>{expires_str}</b>\n"
                f"Осталось: <b>{days_left} дней</b>\n\n"
                f"Продлить подписку?"
            )
        else:
            text = (
                f"📊 <b>Ваша подписка</b>\n\n"
                f"Тариф: <b>{tier.upper()}</b> (истекла)\n\n"
                f"Продлите подписку, чтобы вернуть доступ к функциям!"
            )
        keyboard = get_subscription_keyboard()

    await message.answer(text, reply_markup=keyboard, parse_mode="HTML")
