from rest_framework import serializers
from statscan.models import Cubes


# list Cubes
class CubeSerializer(serializers.Serializer):
    productId = serializers.IntegerField()
    cansimId = serializers.CharField()
    cubeTitleEn = serializers.CharField()
    frequencyCode = serializers.IntegerField()
