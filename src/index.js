const placeInput = document.getElementById("place-input");
const autocomplete = new google.maps.places.Autocomplete(placeInput);

const today = new Date();

const description = document.getElementById('description')
const temp = document.getElementById('temp')
const tempMin = document.getElementById('temp-min')
const tempMax = document.getElementById('temp-max')
const fellsLike = document.getElementById('feels-like')
const humidity = document.getElementById('humidity')
const cloudsAll = document.getElementById('clouds-all')
const windDeg = document.getElementById('wind-deg')
const windSpeed = document.getElementById('wind-speed')
const visibility = document.getElementById('visibility')
const city = document.getElementById('city')
const forecastHours = document.getElementById('forecast-hours')
const forecastDaily = document.getElementById('forecast-daily')

const iconToGif = {
    "01d": "../gif/soleado.gif",
    "02d": "../gif/pocas-nubes.gif",
    "03d": "../gif/nubes-dispersas.gif",
    "04d": "../gif/nubes-rotas.gif",
    "09d": "../gif/lluvia.gif",
    "10d": "../gif/lluvia-fuerte.gif",
    "11d": "../gif/tormenta.gif",
    "13d": "../gif/nieve.gif",
    "50d": "../gif/niebla.gif",
    "01n": "../gif/soleado.gif",
    "02n": "../gif/pocas-nubes.gif",
    "03n": "../gif/nubes-dispersas.gif",
    "04n": "../gif/nubes-rotas.gif",
    "09n": "../gif/lluvia.gif",
    "10n": "../gif/lluvia-fuerte.gif",
    "11n": "../gif/tormenta.gif",
    "13n": "../gif/nieve.gif",
    "50n": "../gif/niebla.gif",
  };

let city_name = 'Buenos Aires'



// Obtener la ciudad del usuario utilizando geocodificación inversa
const ubiConfirm = confirm('Permitir acceder a tu ubicacion para mejorar su experiencia')
if (ubiConfirm) {
    

    async function getCityFromCoords(lat, lon) {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=AIzaSyBbbTKhaC8LtvrBvaMAr_sWkSHD0ZrlG8c`);
        const data = await response.json();
        const city = data.results[0].address_components.find(component =>
        component.types.includes('locality')
        );
        return city ? city.long_name : 'Ciudad no encontrada';
    }
    
    // Solicitar la ubicación al usuario
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
    
        // Obtener la ciudad del usuario
        city_name = await getCityFromCoords(lat, lon);
    
        // Luego puedes llamar a tu función Weather() con las coordenadas y la ciudad
        Weather(lat, lon);
    
        }, function(error) {
        // Maneja cualquier error que ocurra durante la obtención de la ubicación
        console.error("Error al obtener la ubicación:", error.message);
        });
    } else {
        // El navegador no soporta la geolocalización
        console.log("La geolocalización no está soportada por este navegador.");
    }
}else{
    Weather(-34.6036844, -58.3815591)
}

function degreesToCompassShort(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
    const index = Math.round((degrees % 360) / 45);
    return directions[index];
}

autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      return;
    }
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
  
    // Obtener la ciudad del lugar seleccionado
    city_name = place.address_components.find(component =>
      component.types.includes('locality')
    );
    if (city) {
        city_name = city_name.long_name
    } else {
      console.log("Ciudad no encontrada.");
    }
  
    Weather(lat, lng);
});
  

async function Weather(lat,lon){

    forecastHours.innerHTML = "";
    forecastDaily.innerHTML = "";

    let responseWeather = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=fec079aff200d4f945e03bed43b57b9f&units=metric&lang=sp`);
    let responseForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=fec079aff200d4f945e03bed43b57b9f&units=metric&lang=sp`)
    let resultsWeather = await responseWeather.json();
    let resultsForecast = await responseForecast.json()

    city.innerText = city_name
    const icon = resultsWeather.weather[0].icon
    const gif = iconToGif[icon];
    document.getElementById('bg-gif').style.backgroundImage = `url('${gif}')`;
    description.innerHTML = resultsWeather.weather[0].description
    temp.innerText = resultsWeather.main.temp.toFixed(0)
    tempMin.innerText = resultsWeather.main.temp_min.toFixed(0)
    tempMax.innerText = resultsWeather.main.temp_max.toFixed(0)
    fellsLike.innerText = resultsWeather.main.feels_like.toFixed(0)
    humidity.innerText = resultsWeather.main.humidity
    cloudsAll.innerText = resultsWeather.clouds.all
    const directionShort = degreesToCompassShort(resultsWeather.wind.deg);
    windDeg.innerText = directionShort
    windSpeed.innerText = (resultsWeather.wind.speed * (1.0/1000) * (3600/1.0)).toFixed(1)
    visibility.innerText = (resultsWeather.visibility / 1000)


    for (let i = 0; i < 8; i++) {
        
        let divHours = document.createElement('div')
        divHours.className = "ml-auto p-2"

        const dt_txt = resultsForecast.list[i].dt_txt;

        const part = dt_txt.split(" ");

        const hoursMinute = part[1];

        const [hora, minutos] = hoursMinute.split(":");

        const horaYMinutos = hora + ":" + minutos;


        divHours.innerHTML = `
            <p style="font-size: 12px">${horaYMinutos}</p>
            <img src="https://openweathermap.org/img/wn/${resultsForecast.list[i].weather[0].icon}@2x.png" alt="icon" width="40px">
            <p>${(resultsForecast.list[i].main.temp).toFixed(0)}°C</p>
        `;

        forecastHours.appendChild(divHours);
    }



    function getabbreviatedDay(fecha) {
        const diasSemana = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
        const diaSemana = fecha.getDay(); 
        return diasSemana[diaSemana];
    }

    // Agrupar elementos con la misma fecha (ignorando la hora)
    function groupByDay(weatherData) {
        const groupedWeather = {};
        weatherData.forEach(item => {
            const date = item.dt_txt.split(" ")[0]; 
            if (!groupedWeather[date]) {
                groupedWeather[date] = [];
            }
            groupedWeather[date].push(item);
        });
        return groupedWeather;
    }

    // Obtener los datos climáticos para los días siguientes al día actual
    function getWeatherForNextDays(groupedWeather) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Filtrar y ordenar las fechas para los días siguientes al día actual
        const nextDates = Object.keys(groupedWeather)
            .filter(date => new Date(date) > currentDate)
            .sort();

        // Obtener los datos climáticos para los días siguientes al día actual
        const nextWeather = nextDates.map(date => {
            const weatherForDay = groupedWeather[date];
            const minTemp = Math.min(...weatherForDay.map(item => item.main.temp_min));
            const maxTemp = Math.max(...weatherForDay.map(item => item.main.temp_max));
            const description = weatherForDay[Math.floor(weatherForDay.length / 2)].weather[0].description;
            const humidity = weatherForDay[Math.floor(weatherForDay.length / 2)].main.humidity;
            const icon = weatherForDay[Math.floor(weatherForDay.length / 2)].weather[0].icon;

            // Obtener el día de la semana abreviado para esta fecha
            const fecha = new Date(date);
            const abbreviatedDay = getabbreviatedDay(fecha);

            return { date, abbreviatedDay, minTemp, maxTemp, description, humidity, icon };
        });

        return nextWeather;
    }

    // Suponiendo que 'weatherData' es tu lista de datos climáticos
    const groupedWeather = groupByDay(resultsForecast.list);
    const nextWeather = getWeatherForNextDays(groupedWeather);

    nextWeather.forEach(i => {
        let divDaily = document.createElement('div');
        divDaily.className = "bg-dark-gray-blue/10 rounded-xl flex py-5 px-6 items-center";
        divDaily.innerHTML = `
            <p class="mr-3 text-lg font-bold">${i.abbreviatedDay}</p>
            <img src="https://openweathermap.org/img/wn/${i.icon}@2x.png" alt="icon" width="30px">
            <p class="ml-auto text-dark-gray-blue">${(i.maxTemp).toFixed(0)}°<span class="text-dark-gray-blue/70">${(i.minTemp).toFixed(0)}°</span></p>
            <p class="ml-auto text-dark-gray-blue/80">${i.description}</p>
            <p class="ml-auto font-bold">${i.humidity} %</p>
        `;
        forecastDaily.appendChild(divDaily);
    });

}