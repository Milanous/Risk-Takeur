/*
	Risk Takeur — Mini galerie photo avec lightbox
	Vanilla JS, sans dépendance. Fonctionne avec .rt-gallery / .rt-gallery-item.
	- Clic : ouverture en plein écran
	- Flèches ← → : navigation | Échap : fermeture
	- Swipe tactile sur mobile
	- Préchargement des images adjacentes
*/

(function () {
	'use strict';

	var galleries = document.querySelectorAll('.rt-gallery');
	if (galleries.length === 0) return;

	/* --- Construction du lightbox (une seule fois) --- */
	var lightbox = document.createElement('div');
	lightbox.className = 'rt-lightbox';
	lightbox.setAttribute('role', 'dialog');
	lightbox.setAttribute('aria-modal', 'true');
	lightbox.setAttribute('aria-label', 'Visionneuse de photos');
	lightbox.innerHTML =
		'<button class="rt-lightbox-close" aria-label="Fermer (Échap)">&times;</button>' +
		'<button class="rt-lightbox-prev" aria-label="Photo précédente (flèche gauche)">&#10094;</button>' +
		'<button class="rt-lightbox-next" aria-label="Photo suivante (flèche droite)">&#10095;</button>' +
		'<figure class="rt-lightbox-figure">' +
			'<img class="rt-lightbox-img" alt="" />' +
			'<figcaption class="rt-lightbox-caption"></figcaption>' +
		'</figure>' +
		'<div class="rt-lightbox-counter" aria-live="polite"></div>';
	document.body.appendChild(lightbox);

	var imgEl = lightbox.querySelector('.rt-lightbox-img');
	var captionEl = lightbox.querySelector('.rt-lightbox-caption');
	var counterEl = lightbox.querySelector('.rt-lightbox-counter');
	var closeBtn = lightbox.querySelector('.rt-lightbox-close');
	var prevBtn = lightbox.querySelector('.rt-lightbox-prev');
	var nextBtn = lightbox.querySelector('.rt-lightbox-next');

	var items = [];
	var current = -1;
	var lastFocused = null;

	function preload(index) {
		if (index < 0 || index >= items.length) return;
		var im = new Image();
		im.src = items[index].href;
	}

	function show(index) {
		current = (index + items.length) % items.length;
		var item = items[current];
		imgEl.classList.remove('is-loaded');
		imgEl.src = item.href;
		imgEl.alt = (item.querySelector('img') || {}).alt || '';
		captionEl.textContent = item.getAttribute('data-caption') || '';
		counterEl.textContent = (current + 1) + ' / ' + items.length;
		if (imgEl.complete) imgEl.classList.add('is-loaded');
		preload(current + 1);
		preload(current - 1);
	}

	imgEl.addEventListener('load', function () {
		imgEl.classList.add('is-loaded');
	});

	function open(galleryItems, index) {
		items = galleryItems;
		lastFocused = document.activeElement;
		lightbox.classList.add('is-open');
		document.body.classList.add('rt-lightbox-active');
		show(index);
		closeBtn.focus();
	}

	function close() {
		lightbox.classList.remove('is-open');
		document.body.classList.remove('rt-lightbox-active');
		imgEl.src = '';
		if (lastFocused && lastFocused.focus) lastFocused.focus();
	}

	closeBtn.addEventListener('click', close);
	prevBtn.addEventListener('click', function () { show(current - 1); });
	nextBtn.addEventListener('click', function () { show(current + 1); });

	/* Clic sur le fond = fermeture */
	lightbox.addEventListener('click', function (e) {
		if (e.target === lightbox || e.target.classList.contains('rt-lightbox-figure'))
			close();
	});

	/* Clavier */
	document.addEventListener('keydown', function (e) {
		if (!lightbox.classList.contains('is-open')) return;
		switch (e.key) {
			case 'Escape': close(); break;
			case 'ArrowLeft': show(current - 1); break;
			case 'ArrowRight': show(current + 1); break;
			case 'Tab':
				/* Piège de focus simple entre les 3 boutons */
				e.preventDefault();
				var focusables = [closeBtn, prevBtn, nextBtn];
				var i = focusables.indexOf(document.activeElement);
				var next = e.shiftKey ? (i - 1 + 3) % 3 : (i + 1) % 3;
				focusables[next].focus();
				break;
		}
	});

	/* Swipe tactile */
	var touchStartX = null;
	lightbox.addEventListener('touchstart', function (e) {
		touchStartX = e.changedTouches[0].clientX;
	}, { passive: true });
	lightbox.addEventListener('touchend', function (e) {
		if (touchStartX === null) return;
		var dx = e.changedTouches[0].clientX - touchStartX;
		touchStartX = null;
		if (Math.abs(dx) > 40) show(dx > 0 ? current - 1 : current + 1);
	}, { passive: true });

	/* --- Branchement de chaque galerie --- */
	galleries.forEach(function (gallery) {
		var galleryItems = Array.prototype.slice.call(
			gallery.querySelectorAll('.rt-gallery-item')
		);
		galleryItems.forEach(function (item, index) {
			item.addEventListener('click', function (e) {
				e.preventDefault();
				open(galleryItems, index);
			});
		});
	});
})();
