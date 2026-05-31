// Interaksi UI tambahan di luar fungsi peta QGIS2Web.
document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.getElementById('menuBtn');
    const menuIcon = document.getElementById('menuIcon');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileBackdrop = document.getElementById('mobileBackdrop');
    const backToTop = document.getElementById('backToTop');
    const currentYear = document.getElementById('currentYear');

    if (currentYear) currentYear.textContent = new Date().getFullYear();

    if (menuBtn && menuIcon && mobileMenu && mobileBackdrop) {
        function openMobileMenu() {
            mobileBackdrop.classList.remove('hidden');
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('flex');
            requestAnimationFrame(function () {
                mobileBackdrop.classList.remove('opacity-0');
                mobileMenu.classList.remove('opacity-0', 'scale-95');
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times', 'rotate-90');
                menuBtn.setAttribute('aria-expanded', 'true');
            });
        }

        function closeMobileMenu() {
            mobileBackdrop.classList.add('opacity-0');
            mobileMenu.classList.add('opacity-0', 'scale-95');
            menuIcon.classList.remove('fa-times', 'rotate-90');
            menuIcon.classList.add('fa-bars');
            menuBtn.setAttribute('aria-expanded', 'false');
            setTimeout(function () {
                mobileBackdrop.classList.add('hidden');
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
            }, 260);
        }

        function toggleMobileMenu() {
            if (mobileMenu.classList.contains('hidden')) openMobileMenu();
            else closeMobileMenu();
        }

        menuBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleMobileMenu();
        });

        mobileBackdrop.addEventListener('click', closeMobileMenu);
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) closeMobileMenu();
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth >= 768 && !mobileMenu.classList.contains('hidden')) closeMobileMenu();
        });
    }

    document.querySelectorAll('a[href="#peta"]').forEach(function (link) {
        link.addEventListener('click', function () {
            setTimeout(function () {
                if (window.map && typeof window.map.invalidateSize === 'function') {
                    window.map.invalidateSize();
                }
            }, 450);
        });
    });

    window.addEventListener('scroll', function () {
        if (!backToTop) return;
        if (window.scrollY > 480) backToTop.classList.add('show');
        else backToTop.classList.remove('show');
    });

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(function () {
            preloader.classList.add('hide');
            setTimeout(function () { preloader.remove(); }, 520);
        }, 300);
    }

    if (window.map && typeof window.map.invalidateSize === 'function') {
        setTimeout(function () { window.map.invalidateSize(); }, 300);
    }
});

window.addEventListener('resize', function () {
    if (window.map && typeof window.map.invalidateSize === 'function') {
        clearTimeout(window.__petadenResizeTimer);
        window.__petadenResizeTimer = setTimeout(function () { window.map.invalidateSize(); }, 180);
    }
});


// Kontrol layer custom PetaDen: menggantikan tampilan layer bawaan yang terlalu kaku.
(function () {
    function getLayerByKey(key) {
        const layers = {
            kampus: window.layer_kampus_sumbar_3,
            wilayah: window.layer_gadm41_IDN_2_2,
            relief: window.layer_ESRIShadedRelief_1,
            dasar: window.layer_Positron_0
        };
        return layers[key] || null;
    }

    function syncLayerToggle(input) {
        if (!window.map || !input) return;
        const layer = getLayerByKey(input.dataset.layerToggle);
        if (!layer) return;

        const isOnMap = window.map.hasLayer(layer);
        input.checked = isOnMap;
    }

    function initCustomLayerToggles() {
        if (!window.map) return;
        document.querySelectorAll('[data-layer-toggle]').forEach(function (input) {
            syncLayerToggle(input);
            input.addEventListener('change', function () {
                const layer = getLayerByKey(input.dataset.layerToggle);
                if (!layer) return;
                if (input.checked) {
                    if (!window.map.hasLayer(layer)) window.map.addLayer(layer);
                } else {
                    if (window.map.hasLayer(layer)) window.map.removeLayer(layer);
                }
            });
        });
    }

    window.addEventListener('load', function () {
        setTimeout(initCustomLayerToggles, 450);
    });
})();


// Panel kontrol layer yang dipindahkan ke dalam area peta.
document.addEventListener('DOMContentLoaded', function () {
    const mapLayerWidget = document.getElementById('mapLayerWidget');
    const mapLayerToggle = document.getElementById('mapLayerToggle');
    const mapLayerPanel = document.getElementById('mapLayerPanel');

    if (!mapLayerWidget || !mapLayerToggle || !mapLayerPanel) return;

    function closeMapLayerPanel() {
        mapLayerPanel.classList.add('hidden');
        mapLayerToggle.classList.remove('is-open');
        mapLayerToggle.setAttribute('aria-expanded', 'false');
    }

    function openMapLayerPanel() {
        mapLayerPanel.classList.remove('hidden');
        mapLayerToggle.classList.add('is-open');
        mapLayerToggle.setAttribute('aria-expanded', 'true');
    }

    mapLayerToggle.addEventListener('click', function (event) {
        event.stopPropagation();
        if (mapLayerPanel.classList.contains('hidden')) openMapLayerPanel();
        else closeMapLayerPanel();
    });

    mapLayerWidget.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    document.addEventListener('click', function (event) {
        if (!mapLayerWidget.contains(event.target)) closeMapLayerPanel();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeMapLayerPanel();
    });

    // Cegah klik/scroll panel menggeser peta di belakangnya.
    window.addEventListener('load', function () {
        if (window.L && L.DomEvent) {
            L.DomEvent.disableClickPropagation(mapLayerWidget);
            L.DomEvent.disableScrollPropagation(mapLayerWidget);
        }
    });
});


// PetaDen v7: pencarian perguruan tinggi berbasis dataset QGIS2Web dengan autocomplete.
(function () {
    function normalizeText(value) {
        return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    function safeText(value, fallback) {
        const text = String(value || '').trim();
        return text && text.toLowerCase() !== 'null' && text.toLowerCase() !== 'undefined' ? text : (fallback || '');
    }

    function getCampusFeatures() {
        if (!window.json_kampus_sumbar_3 || !Array.isArray(window.json_kampus_sumbar_3.features)) return [];
        return window.json_kampus_sumbar_3.features.map(function (feature, index) {
            const props = feature.properties || {};
            return {
                index: index,
                feature: feature,
                name: safeText(props.NAMA_PT, 'Perguruan Tinggi'),
                city: safeText(props.KOTA, 'Sumatera Barat'),
                type: safeText(props.JENIS, 'Perguruan Tinggi'),
                normalized: normalizeText([props.NAMA_PT, props.KOTA, props.JENIS, props.ALAMAT].join(' '))
            };
        });
    }

    function findLayerByFeatureName(name) {
        if (!window.layer_kampus_sumbar_3) return null;
        let found = null;
        window.layer_kampus_sumbar_3.eachLayer(function (layer) {
            const props = (layer.feature && layer.feature.properties) || {};
            if (safeText(props.NAMA_PT) === name) found = layer;
        });
        return found;
    }

    function focusCampus(item) {
        if (!item || !window.map) return;
        const targetLayer = findLayerByFeatureName(item.name);
        if (!targetLayer) return;
        if (!window.map.hasLayer(window.layer_kampus_sumbar_3)) window.map.addLayer(window.layer_kampus_sumbar_3);

        const latlng = targetLayer.getLatLng ? targetLayer.getLatLng() : null;
        if (latlng) {
            window.map.setView(latlng, Math.max(window.map.getZoom(), 14), { animate: true });
            setTimeout(function () { targetLayer.openPopup(); }, 260);
        }
    }

    function initCampusSearch() {
        const input = document.getElementById('univSearch');
        const suggestions = document.getElementById('univSuggestions');
        const clearBtn = document.getElementById('clearUnivSearch');
        if (!input || !suggestions) return;

        const data = getCampusFeatures();
        let activeIndex = -1;
        let currentMatches = [];

        function hideSuggestions() {
            suggestions.classList.remove('show');
            suggestions.innerHTML = '';
            activeIndex = -1;
        }

        function renderSuggestions(matches) {
            suggestions.innerHTML = '';
            currentMatches = matches;
            activeIndex = -1;

            if (!input.value.trim()) {
                hideSuggestions();
                return;
            }

            if (!matches.length) {
                suggestions.innerHTML = '<div class="search-empty">Perguruan tinggi tidak ditemukan.</div>';
                suggestions.classList.add('show');
                return;
            }

            matches.slice(0, 8).forEach(function (item, idx) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'search-suggestion-item';
                button.setAttribute('role', 'option');
                button.innerHTML = '<span class="search-suggestion-icon"><i class="fas fa-university"></i></span>' +
                    '<span class="min-w-0"><span class="search-suggestion-title"></span><span class="search-suggestion-meta"></span></span>';
                button.querySelector('.search-suggestion-title').textContent = item.name;
                button.querySelector('.search-suggestion-meta').textContent = item.type + ' • ' + item.city;
                button.addEventListener('mousedown', function (event) {
                    event.preventDefault();
                    input.value = item.name;
                    if (clearBtn) clearBtn.classList.add('show');
                    hideSuggestions();
                    focusCampus(item);
                });
                suggestions.appendChild(button);
            });
            suggestions.classList.add('show');
        }

        function updateSearch() {
            const q = normalizeText(input.value);
            if (clearBtn) clearBtn.classList.toggle('show', Boolean(input.value.trim()));
            if (!q) {
                hideSuggestions();
                return;
            }
            const matches = data
                .filter(function (item) { return item.normalized.includes(q); })
                .sort(function (a, b) {
                    const aName = normalizeText(a.name);
                    const bName = normalizeText(b.name);
                    const aStarts = aName.startsWith(q) ? 0 : 1;
                    const bStarts = bName.startsWith(q) ? 0 : 1;
                    return aStarts - bStarts || a.name.localeCompare(b.name);
                });
            renderSuggestions(matches);
        }

        input.addEventListener('input', updateSearch);
        input.addEventListener('focus', updateSearch);
        input.addEventListener('keydown', function (event) {
            const items = Array.from(suggestions.querySelectorAll('.search-suggestion-item'));
            if (event.key === 'Escape') hideSuggestions();
            if (!items.length) return;
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                activeIndex = (activeIndex + 1) % items.length;
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                activeIndex = (activeIndex - 1 + items.length) % items.length;
            } else if (event.key === 'Enter') {
                event.preventDefault();
                const item = currentMatches[activeIndex >= 0 ? activeIndex : 0];
                if (item) {
                    input.value = item.name;
                    hideSuggestions();
                    focusCampus(item);
                }
                return;
            } else {
                return;
            }
            items.forEach(function (el, i) { el.classList.toggle('is-active', i === activeIndex); });
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                input.value = '';
                clearBtn.classList.remove('show');
                hideSuggestions();
                input.focus();
            });
        }

        document.addEventListener('click', function (event) {
            if (!suggestions.contains(event.target) && event.target !== input) hideSuggestions();
        });
    }

    window.addEventListener('load', function () {
        setTimeout(initCampusSearch, 450);
    });
})();
