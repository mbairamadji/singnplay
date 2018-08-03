
$('.ui.basic.modal')
    .modal('attach events', '.delete', 'show')
;

$('.ui.small.modal')
    .modal('attach events', '.mymodal', 'show')
;

$('.ui.styled.accordion')
  .accordion()
;
$('.ui.accordion')
  .accordion()
;
 $('.ui.vertical.sidebar').sidebar({
    transition: 'overlay'
});

$('.ui.vertical.sidebar')
  .sidebar('attach events', '.toc.item')
;
