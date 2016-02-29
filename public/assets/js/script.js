// =========
//JavaScript
// =========


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

// ------------------------------------------------
// Blog Archive
// ------------------------------------------------

if ($('#blog-archive').length) {

  // Fold up to start
  $('.posts, .month').hide();

  // Toggle icons to start
  $('.fa-folder-open')
    .removeClass('fa-folder-open')
    .addClass('fa-folder');
  $('.fa-minus')
    .removeClass('fa-minus')
    .addClass('fa-plus');
  
  // Set folder events
  $('.folder.month').folder();
  $('.folder.year').folder({
    iconOpen: 'fa-folder-open',
    iconClosed: 'fa-folder'
  });

}

// ------------------------------------------------
// Blog Categories
// ------------------------------------------------

if ($('#blog-categories').length) {

  // Fold up to start
  $('.posts').hide();

  // Toggle icons to start
  $('.fa-minus')
    .removeClass('fa-minus')
    .addClass('fa-plus');
  
  // Set folder events
  $('.folder.category').folder();

}

// ------------------------------------------------
// Blog Tags
// ------------------------------------------------

if ($('#blog-tags').length) {

  // Fold up to start
  $('.posts').hide();

  // Toggle icons to start
  $('.fa-minus')
    .removeClass('fa-minus')
    .addClass('fa-plus');
  
  // Set folder events
  $('.folder.tag').folder();

}

