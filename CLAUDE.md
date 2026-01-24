# CLAUDE.md - MAIN Community Bot

This file provides guidance to Claude Code when working with this repository.

## Project Overview

MAIN Community Bot - Telegram bot for community management with Mini App integration.

## Architecture

### Bot (Python)
- **Framework**: aiogram 3.x (Telegram Bot API)
- **Database**: PostgreSQL via Supabase
- **ORM**: SQLAlchemy 2.x with asyncpg
- **Hosting**: **Render** (render.com)
- **Entry point**: `main.py`

### Mini App (TypeScript/React)
- See `miniapp/CLAUDE.md` for details
- **Hosting**: Vercel

### Database
- **Provider**: Supabase (PostgreSQL)
- **Connection**: Uses pgbouncer in transaction mode
- **Important**: Must use `prepared_statement_cache_size=0` for asyncpg compatibility

## Deployment

### Bot (Render)
- Auto-deploys from `main` branch
- Dashboard: https://dashboard.render.com
- Logs: Available in Render dashboard

### Mini App (Vercel)
- Auto-deploys from `main` branch (miniapp folder)
- Dashboard: https://vercel.com

## Key Files

| File | Purpose |
|------|---------|
| `main.py` | Bot entry point |
| `app/db/session.py` | Database engine configuration |
| `app/db/models.py` | SQLAlchemy models |
| `app/handlers/` | Telegram command handlers |
| `app/services/` | Business logic services |
| `app/config.py` | Configuration loading |

## Database Notes

**pgbouncer compatibility**: Supabase uses pgbouncer in "transaction" pool mode which doesn't support prepared statements. Always use:

```python
create_async_engine(
    url,
    connect_args={"prepared_statement_cache_size": 0}
)
```

## Commands

```bash
# Run bot locally
python main.py

# Run with poetry
poetry run python main.py
```

## Environment Variables

Required in `.env` or Render environment:
- `BOT_TOKEN` - Telegram bot token
- `DATABASE_URL` - Supabase PostgreSQL connection string (with `?sslmode=require`)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon key
