$.fn.make_tab_controller = function() {
  this.each(function(idx, el) {
    var $el = $(el),
        id = $el.attr('data-controls-for'),
        $elements = $('[data-tab]').filter(function(idx, el) {
          return $(el).attr('data-tab').indexOf(id + ":") === 0;
        }),
        $controls = $el.find('[data-tab]');

    $controls.each(function(idx, el) {
      var $control = $(el),
          tab = $control.attr('data-tab');
      $control.click(function() {
        $controls.removeClass("selected");
        $elements.hide();
        $control.addClass("selected");
        $elements.filter("[data-tab='" + id + ':' + tab + "']").show();
      });
    });
    $controls.first().click();
  });
  return this;
};

$(function() {
  $('[data-controls-for]').make_tab_controller();
});
