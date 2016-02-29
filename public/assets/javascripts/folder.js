// ----------------------------------------
// Folder
// ----------------------------------------
// 
// Folder jQuery plugin
// 

$.fn.folder = function(options) {

  // Set default options
  options = $.extend({
    toggle: '.folder-toggle',
    iconOpen: 'fa-minus',
    iconClosed: 'fa-plus'
  }, options);

  
  // Initialize
  var iconOpen = options['iconOpen'];
  var iconClosed = options['iconClosed'];


  // Toggle Link Icon
  var toggleIcon = function(link) {
    var $icon = $(link).find('.fa');
    var currentIconClass, nextIconClass;

    if ($icon.hasClass(iconOpen)) {
      currentIconClass = iconOpen;
      nextIconClass = iconClosed;
    } else {
      nextIconClass = iconOpen;
      currentIconClass = iconClosed;
    }

    $icon.removeClass(currentIconClass)
      .addClass(nextIconClass);
  };


  // Toggle Folder Slide Open/Closed
  var toggleFolderSlide = function(link) {
    var $folder = $(link)
      .parent()
      .parent()
      .find('> div');

    $folder.slideToggle();
  };


  // Link Click Event
  var onClick = function(e) {
    e.preventDefault();

    toggleIcon(this);
    toggleFolderSlide(this);

    return false;
  };


  // Set click events
  $(this).each(function(index, element) {
    var $a = $(element).find(options['toggle']).first();
    $a.click(onClick);
  });


  return this;
};

