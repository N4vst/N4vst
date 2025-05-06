# Generated manually on 2025-05-06 19:45

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        ('dpp', '0001_initial'),  # Depend on dpp.0001_initial
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='organization',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users', to='dpp.organization', verbose_name='Organization'),
        ),
    ] 