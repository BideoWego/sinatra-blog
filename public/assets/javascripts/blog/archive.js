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

