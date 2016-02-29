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

