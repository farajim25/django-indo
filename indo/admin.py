import json

from django import forms
from django.core.exceptions import PermissionDenied
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from django.urls import path

from .funcs import indo_upgrade_widget


class IndoResponseMixin:
    def get_indo_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name
        urls = [
            path(
                '<path:object_id>/indo/',
                self.indo_response,
                name='%s_%s_indo' % info,
            )
        ]
        return urls

    def get_urls(self):
        urls = super().get_urls()
        indo_urls = self.get_indo_urls()
        return indo_urls + urls

    def indo_response_field_value(self, request, obj, field):
        return None

    def indo_make_response(self, request, obj, field):
        # First read_from indo_response_field_value
        value = self.indo_response_field_value(request, obj, field)
        if value is not None:
            return {field: value}

        # Second Check obj has parameter
        if hasattr(obj, field):
            return {field: getattr(obj, field)}

        # third check if callable exists
        admin_field = getattr(self, field, None)
        if callable(admin_field):
            return {field: admin_field(obj)}

        return {}

    def indo_response(self, request, object_id):
        parameter = request.GET.get('indo_field', None)
        if not parameter or parameter == 'pk':
            parameter = self.model._meta.pk.name

        content = {}
        obj = self.get_object(request, object_id)

        if not self.has_view_permission(request, obj):
            raise PermissionDenied

        if obj:
            content = self.indo_make_response(request, obj, parameter)

        return HttpResponse(
            json.dumps(content, cls=DjangoJSONEncoder),
            content_type="application/json"
        )


class IndoSetFieldMixin:
    indo_fields = {}  # name: fk

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        form_field = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name in self.indo_fields:
            indo_field = self.indo_fields[db_field.name]

            from_field_name, retrive_field_name = \
                indo_field.split('__', maxsplit=1)

            indo_upgrade_widget(
                form_field.widget,
                db_field.model,
                db_field.name,
                from_field_name,
                retrive_field_name,
                self.admin_site
            )
        return form_field

    def get_indo_media(self):
        js = [
            'indo/indo.js',
        ]
        css = {
            '': ('indo/indo.css', ),
        }
        return forms.Media(js=js, css=css)

    @property
    def media(self):
        super_media = super().media
        return super_media + self.get_indo_media()


class IndoFullMixin(IndoResponseMixin, IndoSetFieldMixin):
    pass
