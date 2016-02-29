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

