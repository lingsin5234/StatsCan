from django.db import models


class Cubes(models.Model):
    productId = models.IntegerField()
    cansimId = models.CharField(max_length=20, null=True)
    cubeTitleEn = models.TextField()
    frequencyCode = models.IntegerField(null=True)

    def __str__(self):
        return str(self.productId) + ' - ' + str(self.cubeTitleEn)
