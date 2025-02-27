from functools import wraps
from flask import request, jsonify
import jwt
from dotenv import load_dotenv
import os
load_dotenv()

SECRET_KEY = os.environ.get("SECRET_KEY")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        else:
            return jsonify({'message':'Token is missing or invalid'})
        try:
            data_decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = {'user_id': data_decoded['user_id'],
                            'role': data_decoded['role'],'user_name': data_decoded['user_name']}
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 405
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 403
        return f(current_user, *args, **kwargs)

    return decorated

def role_required(required_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user,*args,**kwargs):
            if current_user["role"] not in required_roles:
                return jsonify({'message':'Access forbidden: Insufficient permissions'}),403
            return f(current_user,*args,**kwargs)
        return decorated_function
    return decorator








