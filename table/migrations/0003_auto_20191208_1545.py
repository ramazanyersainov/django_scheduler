# Generated by Django 3.0 on 2019-12-08 15:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('table', '0002_auto_20191206_1342'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='cr_ects',
            field=models.CharField(max_length=100),
        ),
    ]
