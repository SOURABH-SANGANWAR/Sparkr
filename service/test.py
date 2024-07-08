auth, queryset = verify_role_based_auth(request, ['admin', 'user'], self.queryset)
if auth:
    instance = queryset.get(id=data.get('id'))
    if not instance:
        return Response({'error': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
    serialized_data = BaseModelSerializer(instance)
    return Response({'data': serialized_data.data}, status=status.HTTP_200_OK)
else:
    return Response({'error': 'Forbidden'}, status.HTTP_401_UNAUTHORIZED)
