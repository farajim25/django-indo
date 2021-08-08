'use strict';
{
    function get_from_elem(to_elem) {
        var _id = to_elem.attr('id');
        var indo_to_field = to_elem.attr('indo_to_field');
        var indo_from_field = to_elem.attr('indo_from_field');
        var select_id = _id.replace(indo_to_field, indo_from_field);
        return django.jQuery("#" + select_id);
    }

    function unset(to_elem) {
        var from_elem = get_from_elem(to_elem);
        from_elem.unbind('change', handle_indo_response);
    };

    function init(to_elem) {
        // Guard
        if (to_elem.attr('indo').toLowerCase() == 'false') {
            return
        }
        var _id = to_elem.attr('id');
        var from_elem = get_from_elem(to_elem);
        from_elem.on("change", { 'to_id': _id }, handle_indo_response);
    };

    function init_loading(elem) {
        if (elem.siblings('.lds-ring').length == 0) {
            elem.after('<div class="lds-ring" style="display: none;"><div></div><div></div><div></div></div>')
        }
    }

    function handle_indo_response(e) {
        var _to_elem = django.jQuery("#" + e.data.to_id);
        var url_template = _to_elem.attr('indo_url_template');

        var object_id = django.jQuery(this).val();
        var indo_retrive_field = _to_elem.attr('indo_retrive_field');
        if (url_template && object_id) {
            get_indo_obj(
                url_template,
                object_id,
                indo_retrive_field,
                e.data.to_id,
                function (result) {
                    var value = result[indo_retrive_field];
                    _to_elem.val(value);
                    _to_elem.text(value);
                    _to_elem.trigger("change");
                }
            );
        };
    }

    function handle_auto(to_elem) {
        // Guard
        if (to_elem.attr('indo').toLowerCase() == 'false') {
            return
        }
        if (to_elem.attr('indo_initial').toLowerCase() == 'false') {
            return
        }

        var from_elem = get_from_elem(to_elem);
        var url_template = to_elem.attr('indo_url_template');
        var object_id = from_elem.val()
        var indo_retrive_field = to_elem.attr('indo_retrive_field');

        if (url_template && object_id) {
            get_indo_obj(
                url_template,
                object_id,
                indo_retrive_field,
                to_elem.attr['id'],
                function (result) {
                    var value = result[indo_retrive_field];
                    to_elem.val(value);
                    to_elem.text(value);
                    to_elem.trigger("change");
                }
            );
        };
    };

    function get_indo_obj(url_template, object_id, retrive_field, elem_id, callback) {
        var url = url_template.replace("__pk__", object_id);
        url = url + '?indo_field=' + retrive_field
        url = encodeURI(url);
        var to_elem = django.jQuery("#" + elem_id);
        django.jQuery.ajax({
            dataType: "json",
            url: url,
            beforeSend: function () {
                to_elem.siblings('.lds-ring').show();
            },
            complete: function () {
                to_elem.siblings('.lds-ring').hide();
            },
            success: callback,
        });
    };


    window.addEventListener('load', function () {
        // handle base indo
        django.jQuery("[indo]").each(function (index) {
            init(django.jQuery(this));
            init_loading(django.jQuery(this));
        });

        // handle automatic call on load
        django.jQuery("[indo][indo_initial]").each(function (index) {
            handle_auto(django.jQuery(this));
        });

        // handle add extra inlines
        django.jQuery(".add-row a").on('click', function () {
            setTimeout(function () {
                django.jQuery("[indo]").each(function (index) {
                    unset(django.jQuery(this));
                });
                django.jQuery("[indo]").each(function (index) {
                    init(django.jQuery(this));
                });
            }, 50);
        });

        // change django related_lookup function to trigger change event 
        django.jQuery("a.related-lookup").on('django:lookup-related', function () {
            if (!window.trigger_added) {
                var old_dismissRelatedLookupPopup = dismissRelatedLookupPopup;
                dismissRelatedLookupPopup = function (win, chosenId) {
                    old_dismissRelatedLookupPopup(win, chosenId);
                    django.jQuery('#' + win.name).trigger('change')
                    console.log('gg')
                };
                window.dismissRelatedLookupPopup = dismissRelatedLookupPopup;
                window.trigger_added = true
            }
        });
    });
}
