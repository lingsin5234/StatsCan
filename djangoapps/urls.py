"""djangoapps URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path

from statscan import views as statscan_vw

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^$', statscan_vw.project_markdown),
    re_path(r'^runJob', statscan_vw.run_oper),
    re_path(r'^listCubes', statscan_vw.listCubes),
    re_path(r'api/list_cubes', statscan_vw.CubesAPI.as_view(), name='api_list_cubes'),
    re_path(r'plot/milk_products', statscan_vw.plotMilkProducts),
    re_path(r'plot/ghg_emissions', statscan_vw.plotGHGEmissions),
]
