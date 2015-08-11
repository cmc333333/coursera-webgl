$.fn.sets_with = function() {
  this.each(function(idx, el) {
    var $control = $(el),
        ids = $control.attr('data-sets-input').split(','),
        elements = $.map(ids, function(id) {
          return $('#' + id);
        });
    $control.on("input change", function() {
      for (var i = 0, len = elements.length; i < len; i++) {
        elements[i].val($control.val());
      }
    });
  });
  return this;
};

$(function() {
  $('[data-sets-input]').sets_with();
});

