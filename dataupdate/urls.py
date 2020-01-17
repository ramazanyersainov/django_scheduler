from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='dataupdate-home'),
    path('update/', views.update, name='dataupdate-update'),
]