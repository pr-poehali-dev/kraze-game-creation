import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Работа с игровой историей и балансом
    POST /game - сохранить результат игры и обновить баланс
    GET /game?user_id=X - получить историю игр пользователя
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        result = body_data.get('result')
        bet_amount = body_data.get('bet_amount')
        multiplier = body_data.get('multiplier')
        win_amount = body_data.get('win_amount', 0)
        
        if not all([user_id, result, bet_amount is not None, multiplier]):
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required fields'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "INSERT INTO game_history (user_id, result, bet_amount, multiplier, win_amount) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (user_id, result, bet_amount, multiplier, win_amount)
        )
        game_id = cur.fetchone()[0]
        
        if result == 'win':
            cur.execute("UPDATE users SET balance = balance + %s WHERE id = %s", (win_amount, user_id))
        
        conn.commit()
        
        cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
        new_balance = cur.fetchone()[0]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'game_id': game_id, 'balance': new_balance}),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id')
        
        if not user_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "SELECT id, result, bet_amount, multiplier, win_amount, created_at FROM game_history WHERE user_id = %s ORDER BY created_at DESC LIMIT 10",
            (user_id,)
        )
        rows = cur.fetchall()
        
        history = [{
            'id': row[0],
            'result': row[1],
            'bet_amount': row[2],
            'multiplier': float(row[3]),
            'win_amount': row[4],
            'created_at': row[5].isoformat() if row[5] else None
        } for row in rows]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'history': history}),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
