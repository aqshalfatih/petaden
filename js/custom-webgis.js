// Interaksi UI tambahan di luar fungsi peta QGIS2Web.
document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.getElementById('menuBtn');
    const menuIcon = document.getElementById('menuIcon');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileBackdrop = document.getElementById('mobileBackdrop');
    const backToTop = document.getElementById('backToTop');
    const currentYear = document.getElementById('currentYear');



// Splash Screen PetaDen Premium
const splashScreen = document.getElementById('splashScreen');
const splashPercent = document.getElementById('splashPercent');

if (splashScreen) {
  document.body.classList.add('splash-active');

  let percent = 0;
  const percentTimer = setInterval(function () {
    percent += Math.floor(Math.random() * 9) + 4;

    if (percent >= 100) {
      percent = 100;
      clearInterval(percentTimer);
    }

    if (splashPercent) {
      splashPercent.textContent = percent + '%';
    }
  }, 140);

  window.addEventListener('load', function () {
    setTimeout(function () {
      if (splashPercent) {
        splashPercent.textContent = '100%';
      }

      splashScreen.classList.add('splash-hide');
      document.body.classList.remove('splash-active');

      setTimeout(function () {
        splashScreen.remove();
      }, 650);
    }, 2000);
  });
}
// HAPUS YG DIATAS

    if (currentYear) currentYear.textContent = new Date().getFullYear();

    const desktopNavLinks = document.querySelectorAll('.desktop-nav-link');

    function setActiveDesktopNav(target) {
        desktopNavLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.dataset.navTarget === target);
        });
    }

    function updateDesktopNavOnScroll() {
        if (!desktopNavLinks.length) return;

        const offset = 120;
        const scrollPosition = window.scrollY + offset;
        const sections = ['peta', 'statistik', 'tentang', 'tim'];

        let activeSection = 'beranda';

        sections.forEach(function (sectionId) {
            const section = document.getElementById(sectionId);
            if (section && scrollPosition >= section.offsetTop) {
                activeSection = sectionId;
            }
        });

        setActiveDesktopNav(activeSection);
    }

    if (desktopNavLinks.length) {
        desktopNavLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                setActiveDesktopNav(link.dataset.navTarget || 'beranda');
            });
        });

        updateDesktopNavOnScroll();
        window.addEventListener('scroll', updateDesktopNavOnScroll, { passive: true });
    }

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


// Kontrol layer custom PetaDen: tetap memakai panel asli project, isi layer menyesuaikan file ori QGIS2Web.
(function () {
    function getLayerByKey(key) {
        const layers = {
            universitas: window.layer_SebaranUniversitas_3,
            sekolahTinggi: window.layer_SebaranSekolahTinggi_4,
            akademi: window.layer_SebaranAkademi_5,
            institut: window.layer_SebaranInstitut_6,
            politeknik: window.layer_SebaranPoliteknik_7,
            wilayah: window.layer_BatasKabupaten_2,
            dasar: window.layer_GoogleSatellite_0
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

    function syncAllLayerToggles() {
        document.querySelectorAll('[data-layer-toggle]').forEach(syncLayerToggle);
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
                    if (layer.bringToFront && input.dataset.layerToggle !== 'wilayah') layer.bringToFront();
                } else {
                    if (window.map.hasLayer(layer)) window.map.removeLayer(layer);
                }
            });
        });

        window.map.on('layeradd layerremove', function () {
            setTimeout(syncAllLayerToggles, 0);
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


// PetaDen v8: pencarian perguruan tinggi membaca semua layer jenis PT dari file ori QGIS2Web.
(function () {
    function normalizeText(value) {
        return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    function safeText(value, fallback) {
        const text = String(value || '').trim();
        return text && text.toLowerCase() !== 'null' && text.toLowerCase() !== 'undefined' ? text : (fallback || '');
    }

    function campusSources() {
        return [
            { key: 'universitas', json: window.json_SebaranUniversitas_3, layer: window.layer_SebaranUniversitas_3, type: 'Universitas' },
            { key: 'sekolahTinggi', json: window.json_SebaranSekolahTinggi_4, layer: window.layer_SebaranSekolahTinggi_4, type: 'Sekolah Tinggi' },
            { key: 'akademi', json: window.json_SebaranAkademi_5, layer: window.layer_SebaranAkademi_5, type: 'Akademi' },
            { key: 'institut', json: window.json_SebaranInstitut_6, layer: window.layer_SebaranInstitut_6, type: 'Institut' },
            { key: 'politeknik', json: window.json_SebaranPoliteknik_7, layer: window.layer_SebaranPoliteknik_7, type: 'Politeknik' }
        ];
    }

    function getCampusFeatures() {
        const items = [];
        campusSources().forEach(function (source) {
            if (!source.json || !Array.isArray(source.json.features)) return;
            source.json.features.forEach(function (feature, index) {
                const props = feature.properties || {};
                const type = safeText(props.JENIS, source.type);
                items.push({
                    index: index,
                    sourceKey: source.key,
                    layerGroup: source.layer,
                    feature: feature,
                    name: safeText(props.NAMA_PT, 'Perguruan Tinggi'),
                    city: safeText(props.KOTA, 'Sumatera Barat'),
                    type: type,
                    normalized: normalizeText([props.NAMA_PT, props.KOTA, type, props.ALAMAT].join(' '))
                });
            });
        });
        return items;
    }

    function findLayerByFeatureName(item) {
        if (!item || !item.layerGroup) return null;
        let found = null;
        item.layerGroup.eachLayer(function (layer) {
            const props = (layer.feature && layer.feature.properties) || {};
            if (safeText(props.NAMA_PT) === item.name) found = layer;
        });
        return found;
    }

    function focusCampus(item) {
        if (!item || !window.map) return;
        if (item.layerGroup && !window.map.hasLayer(item.layerGroup)) {
            window.map.addLayer(item.layerGroup);
        }

        const targetLayer = findLayerByFeatureName(item);
        if (!targetLayer) return;

        if (item.layerGroup && item.layerGroup.bringToFront) item.layerGroup.bringToFront();
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

            matches.slice(0, 8).forEach(function (item) {
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

(function () {
  const modal = document.getElementById("statTypeModal");
  const backdrop = document.getElementById("statTypeBackdrop");
  const closeBtn = document.getElementById("statTypeClose");
  const titleEl = document.getElementById("statTypeTitle");
  const countEl = document.getElementById("statTypeCount");
  const listEl = document.getElementById("statTypeList");

  if (!modal || !titleEl || !countEl || !listEl) return;

  const typeLayerMap = {
    "Universitas":
      typeof layer_SebaranUniversitas_3 !== "undefined"
        ? layer_SebaranUniversitas_3
        : null,

    "Sekolah Tinggi":
      typeof layer_SebaranSekolahTinggi_4 !== "undefined"
        ? layer_SebaranSekolahTinggi_4
        : null,

    "Akademi":
      typeof layer_SebaranAkademi_5 !== "undefined"
        ? layer_SebaranAkademi_5
        : null,

    "Institut":
      typeof layer_SebaranInstitut_6 !== "undefined"
        ? layer_SebaranInstitut_6
        : null,

    "Politeknik":
      typeof layer_SebaranPoliteknik_7 !== "undefined"
        ? layer_SebaranPoliteknik_7
        : null,
  };

  const typeToggleMap = {
    "Universitas": "universitas",
    "Sekolah Tinggi": "sekolahTinggi",
    "Akademi": "akademi",
    "Institut": "institut",
    "Politeknik": "politeknik",
  };

  let activeItems = [];

  function safeText(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getCampusItemsByType(type) {
    const layerGroup = typeLayerMap[type];
    const items = [];

    if (!layerGroup || typeof layerGroup.eachLayer !== "function") {
      return items;
    }

    layerGroup.eachLayer(function (markerLayer) {
      const props = markerLayer.feature?.properties || {};

      items.push({
        nama: props.NAMA_PT || "Tanpa nama",
        jenis: props.JENIS || type,
        kota: props.KOTA || "-",
        alamat: props.ALAMAT || "",
        akreditasi: props.AKREDITASI || "",
        layer: markerLayer,
      });
    });

    return items.sort(function (a, b) {
      return a.nama.localeCompare(b.nama, "id");
    });
  }

  function renderCampusList(items) {
    if (!items.length) {
      listEl.innerHTML = `
        <div class="rounded-2xl border border-[#7e021e]/15 bg-white/35 p-4 text-center">
          <p class="text-sm font-bold text-[#7e021e]/75">
            Data kampus untuk jenis ini tidak ditemukan.
          </p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items
      .map(function (item, index) {
        const alamat = item.alamat
          ? `<p class="mt-1 line-clamp-2 text-[0.64rem] font-medium leading-4 text-[#7e021e]/65 sm:text-xs sm:leading-5">${safeText(item.alamat)}</p>`
          : "";

        const akreditasi = item.akreditasi
          ? `<span class="rounded-full bg-[#7e021e]/10 px-2 py-0.5 text-[0.58rem] font-black text-[#7e021e] sm:px-2.5 sm:py-1 sm:text-[0.65rem]">Akreditasi ${safeText(item.akreditasi)}</span>`
          : "";

        return `
          <button
            type="button"
            data-stat-campus-index="${index}"
            class="w-full rounded-xl border border-[#7e021e]/15 bg-white/35 p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white/55 hover:shadow-md active:scale-[0.99] sm:rounded-2xl sm:p-3"
          >
            <div class="flex items-start gap-2.5 sm:gap-3">
              <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#7e021e] text-[0.62rem] font-black text-[#f5ebd0] sm:h-8 sm:w-8 sm:rounded-xl sm:text-[0.72rem]">
                ${index + 1}
              </span>

              <div class="min-w-0 flex-1">
                <h4 class="line-clamp-2 text-[0.74rem] font-black leading-snug text-[#7e021e] sm:text-sm">
                  ${safeText(item.nama)}
                </h4>

                <div class="mt-1 flex flex-wrap items-center gap-1.5">
                  <span class="rounded-full bg-[#f5ebd0] px-2 py-0.5 text-[0.58rem] font-black text-[#7e021e] sm:px-2.5 sm:py-1 sm:text-[0.65rem]">
                    ${safeText(item.kota)}
                  </span>
                  ${akreditasi}
                </div>

                ${alamat}
              </div>

              <i class="fas fa-map-marker-alt mt-1 shrink-0 text-xs text-[#7e021e]/70 sm:text-sm"></i>
            </div>
          </button>
        `;
      })
      .join("");
  }

  function openModal(type) {
    activeItems = getCampusItemsByType(type);

    titleEl.textContent = "Daftar " + type;
    countEl.textContent = activeItems.length + " perguruan tinggi";

    renderCampusList(activeItems);

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
  }

  document.querySelectorAll(".stat-type-view-btn").forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      openModal(button.dataset.statType);
    });
  });

  listEl.addEventListener("click", function (e) {
    const itemButton = e.target.closest("[data-stat-campus-index]");
    if (!itemButton) return;

    const index = Number(itemButton.dataset.statCampusIndex);
    const item = activeItems[index];

    if (!item || !item.layer) return;

    closeModal();

    const type = item.jenis;
    const parentLayer = typeLayerMap[type] || Object.values(typeLayerMap).find(function (layerGroup) {
      let found = false;

      if (layerGroup && typeof layerGroup.eachLayer === "function") {
        layerGroup.eachLayer(function (markerLayer) {
          if (markerLayer === item.layer) found = true;
        });
      }

      return found;
    });

    if (typeof map !== "undefined" && parentLayer && !map.hasLayer(parentLayer)) {
      map.addLayer(parentLayer);
    }

    const toggleKey = typeToggleMap[type];
    const toggleInput = toggleKey
      ? document.querySelector('[data-layer-toggle="' + toggleKey + '"]')
      : null;

    if (toggleInput) {
      toggleInput.checked = true;
    }

    const petaSection = document.getElementById("peta");
    if (petaSection) {
      petaSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setTimeout(function () {
      if (typeof map !== "undefined" && typeof item.layer.getLatLng === "function") {
        const latlng = item.layer.getLatLng();

        map.flyTo(latlng, 16, {
          animate: true,
          duration: 1.1,
        });

        setTimeout(function () {
          item.layer.openPopup();
        }, 900);
      }
    }, 450);
  });

  if (backdrop) backdrop.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
})();