from aiogram.fsm.state import State, StatesGroup


class RegistrationStates(StatesGroup):
    """Состояния для процесса регистрации на мероприятие."""
    waiting_for_full_name = State()
    waiting_for_phone = State()
