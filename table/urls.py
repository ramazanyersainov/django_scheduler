from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='table-home'),
    path('search/', views.search, name='table-search'),
    path('about/', views.about, name='table-about')
]