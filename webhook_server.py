#!/usr/bin/env python3
"""
Простой webhook сервер для автоматического деплоя
Установка на VPS:
1. pip install flask
2. Запустить через systemd (см. webhook_deploy.service)
"""

import os
import subprocess
import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)

# Секретный ключ для проверки webhook (установите в GitHub Secrets)
SECRET_KEY = os.environ.get('WEBHOOK_SECRET', 'change_me_in_production')

@app.route('/deploy', methods=['POST'])
def deploy():
    """Обработчик webhook от GitHub Actions"""

    # Проверка секретного ключа (опционально, для безопасности)
    signature = request.headers.get('X-Hub-Signature-256')
    if signature and SECRET_KEY != 'change_me_in_production':
        body = request.get_data()
        expected_signature = 'sha256=' + hmac.new(
            SECRET_KEY.encode(),
            body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected_signature):
            return jsonify({'error': 'Invalid signature'}), 403

    # Запускаем деплой скрипт в фоне
    try:
        subprocess.Popen(['/bin/bash', '/root/maincomby_bot/webhook_deploy.sh'])
        return jsonify({
            'status': 'success',
            'message': 'Deployment started'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Проверка работоспособности webhook сервера"""
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    # Слушаем на localhost:5000 (nginx будет проксировать)
    app.run(host='127.0.0.1', port=5000)
