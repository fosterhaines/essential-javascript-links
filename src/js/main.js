function List_Header_onClick(event) {
  if (this != event.target)
    return;

  var list  = $(this).closest('.List');

  if (!list) {
    console.warn('No parent .List found for this header.');
    return;
  }

  List_setFolded(list, !list.is('.is-folded'));
}

function List_setFolded(list, folded) {
  if (folded)
    list.addClass('is-folded');
  else {
    // we're unfolding this one, so folding anything else
    $('.List:not(.is-folded)').each(function() {
      $(this).addClass('is-folded');
    });

    list.removeClass('is-folded');
  }
}

$(document).ready(function() {
  $('.List').each(function(index) {
    var header = $(this).find('.List-Header');
    if (!header) {
      console.warn('No .List-Header found in this category.');
      return;
    }
    header.click(List_Header_onClick);

    if (index > 0)
      $(this).addClass('is-folded');
  });
});