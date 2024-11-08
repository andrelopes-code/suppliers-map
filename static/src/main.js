const BRAZIL_COORDINATES = [-14.235, -51.925];
const FILL_COLOR = "#151b25";
const STROKE_COLOR = "#4b5260";

const map = L.map("map", { zoomControl: false, attributionControl: false }).setView(BRAZIL_COORDINATES, 4);

const ufMap = {
  RO: 11, // Rondônia
  AC: 12, // Acre
  AM: 13, // Amazonas
  RR: 14, // Roraima
  PA: 15, // Pará
  AP: 16, // Amapá
  TO: 17, // Tocantins
  MA: 21, // Maranhão
  PI: 22, // Piauí
  CE: 23, // Ceará
  RN: 24, // Rio Grande do Norte
  PB: 25, // Paraíba
  PE: 26, // Pernambuco
  AL: 27, // Alagoas
  SE: 28, // Sergipe
  BA: 29, // Bahia
  MG: 31, // Minas Gerais
  ES: 32, // Espírito Santo
  RJ: 33, // Rio de Janeiro
  SP: 35, // São Paulo
  PR: 41, // Paraná
  SC: 42, // Santa Catarina
  RS: 43, // Rio Grande do Sul
  MS: 50, // Mato Grosso do Sul
  MT: 51, // Mato Grosso
  GO: 52, // Goiás
  DF: 53, // Distrito Federal
};

const colors = ["#fbc3bc", "#f7a399", "#f38375", "#ffb4a2"];

let citySuppliers;

function generateSupplierCards(suppliers) {
  const container = document.getElementById("supplier-cards-container");
  container.innerHTML = ""; // Limpar o conteúdo anterior

  suppliers.forEach((supplier) => {
    const card = document.createElement("div");
    card.classList.add(
      "bg-[#19212E]",
      "bg-opacity-75",
      "shadow-md",
      "hover:shadow-lg",
      "px-6",
      "py-3",
      "rounded-lg",
      "transition-transform",
      "hover:translate-x-1",
      "duration-500"
    );

    card.innerHTML = `
      <div class="flex flex-col gap-1 text-slate-200 text-sm">
        <p class="mb-2 font-semibold text-white text-xl">${supplier.name}</p>
        <div class="flex items-center gap-2">
          <i class="flex justify-center items-center ph-map-pin w-5 h-5 ph"></i>
          <span>${supplier.address}</span>
        </div>
        <div class="flex items-center gap-2">
          <i class="flex justify-center items-center w-5 h-5 ph-phone ph"></i>
          <span>${supplier.phone}</span>
        </div>
        <div class="flex items-center gap-2">
          <i class="flex justify-center items-center w-5 h-5 ph-package ph"></i>
          <span>${supplier.products}</span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

async function openDetails(cityName) {
  const suppliers = citySuppliers[cityName];
  if (!suppliers) {
    return;
  }

  const detailsTitle = document.querySelector("#details-title");
  detailsTitle.textContent = cityName;
  generateSupplierCards(suppliers);

  const detailsElement = document.getElementById("details");
  detailsElement.classList.remove("translate-x-full");
  detailsElement.classList.add("translate-x-0");
}

function closeDetails() {
  const detailsElement = document.getElementById("details");
  detailsElement.classList.remove("translate-x-0");
  detailsElement.classList.add("translate-x-full");
}

async function loadStates() {
  try {
    const response = await fetch("http://localhost:8000/static/geojson/br_states.json");
    const data = await response.json();

    L.geoJSON(data, {
      style: {
        weight: 1,
        fillOpacity: 1,
        color: STROKE_COLOR,
        fillColor: FILL_COLOR,
      },
      onEachFeature: function (feature, layer) {
        layer.on("click", async function () {
          loadCities(ufMap[feature.id]);
        });
      },
    }).addTo(map);
  } catch (error) {
    console.error("Erro ao carregar estados:", error);
  }
}

async function loadCities(uf) {
  try {
    const response = await fetch(`http://localhost:8000/static/geojson/geojs-${uf}-mun.json`);
    const data = await response.json();

    map.eachLayer((layer) => {
      if (layer.options.municipios) {
        layer.remove();
      }
    });

    L.geoJSON(data, {
      style: function (feature) {
        const supplier = citySuppliers[feature.properties.name];

        return {
          color: STROKE_COLOR,
          weight: 1,
          fillColor: supplier ? colors[Math.floor(Math.random() * colors.length)] : FILL_COLOR,
          fillOpacity: 1,
        };
      },
      onEachFeature: function (feature, layer) {
        layer.options.municipios = true;

        if (feature.properties && feature.properties.name) {
          layer.bindTooltip(feature.properties.name, {
            permanent: false,
            direction: "top",
            className: "city-tooltip custom-tooltip",
          });

          layer.on({
            mouseover: function (e) {
              const layer = e.target;
              layer.openTooltip();
            },
            mouseout: function (e) {
              const layer = e.target;
              layer.closeTooltip();
            },
            click: function (e) {
              const layer = e.target;
              openDetails(layer.feature.properties.name);
            },
          });
        }
      },
    }).addTo(map);
  } catch (error) {
    console.error("Erro ao carregar municípios:", error);
  }
}

async function init() {
  const response = await fetch("http://localhost:8000/static/data/suppliers.json");
  citySuppliers = await response.json();
  await loadStates();
}

init();