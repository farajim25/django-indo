from django.db.models.fields.related import ForeignKey
from django.urls import reverse


def indo_render_attrs(attrs):
    res = ''
    for key, value in attrs.items():
        res += f'{key}={value} '

    return res


def indo_get_url_template(model, field_name, admin_site):
    db_field = model._meta.get_field(field_name)

    site_name = admin_site.name

    if isinstance(db_field, ForeignKey):
        model = db_field.remote_field.model

    model_name = model._meta.model_name
    app_label = model._meta.app_label

    url_template = reverse(
        f'{site_name}:{app_label}_{model_name}_indo',
        kwargs={'object_id': '__pk__'}
    )

    return url_template


def indo_get_attrs(to_field, from_field, retrive_field, url_template, initial=None, set_id=True):
    indo_attrs = {
        'indo': 'true',
        'indo_from_field': from_field,
        'indo_to_field': to_field,
        'indo_url_template': url_template,
        'indo_retrive_field': retrive_field or 'pk'
    }
    if initial:
        indo_attrs['indo_initial'] = 'true'

    if set_id:
        indo_attrs['id'] = f'id_{to_field}'

    return indo_attrs


def indo_upgrade_widget(widget, model, to_field, from_field, retrive_field, admin_site, initial=None, set_id=False):
    indo_attrs = indo_get_attrs(
        to_field,
        from_field,
        retrive_field,
        indo_get_url_template(model, from_field, admin_site),
        initial,
        set_id
    )

    widget.attrs.update(indo_attrs)
    return widget
