Django-Indo
===========
Auto load field data on change of other field value in django admin with Ajax call

![ ](./docs/images/example.gif)

Requirements
------------
* Django 2.0+


Installation
------------
```bash
pip install django-indo
```

Add ``indo`` to ``INSTALLED_APPS``:


```python
    INSTALLED_APPS = [
        ...
        'indo',
        ...
    ]
```

Example usage
-------------
```python
    from indo.admin import IndoResponseMixin, IndoSetFieldMixin


    @admin.register(Customer)
    class CustomerAdmin(IndoResponseMixin, admin.ModelAdmin):
        fields = (
            'name',
            'address',
        )

    @admin.register(Order)
    class OrderAdmin(IndoSetFieldMixin, admin.ModelAdmin):
        fields = (
            'customer',
            'delivery_address',
        )
        indo_fields = {
            'delivery_address': 'customer__address'
        }
```