// Ouverture de la modale
document.getElementById('btn-open-dialog').addEventListener('click', function () {
    const dialog = new Dialog('prot-dialog', 'btn-open-dialog', 'prot-dialog-label');

    function handleEscape(event) {
        const key = event.which || event.keyCode;

        if (key === ESC_KEYCODE) {
            dialog.close();
            event.stopPropagation();
        }
    }

    /*
     * Ajout des écouteurs
     */
    document.addEventListener('keyup', handleEscape);

    document.getElementById('btn-close-dialog').addEventListener('click', function () {
        dialog.close();
    })
})

// Gestion des disclosures
window.addEventListener(
    'load',
    function () {
        var buttons = document.querySelectorAll(
            'button[aria-expanded][aria-controls]'
        );

        for (var i = 0; i < buttons.length; i++) {
            new DisclosureButton(buttons[i]);
        }
    },
    false
);