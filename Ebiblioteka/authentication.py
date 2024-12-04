from rest_framework_simplejwt.authentication import JWTAuthentication

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        authentication_result = super().authenticate(request)
        if authentication_result is None:
            return None
        user, validated_token = authentication_result
        # Inject 'role' from the token into 'user'
        user.role = validated_token.get('role')
        return (user, validated_token)
