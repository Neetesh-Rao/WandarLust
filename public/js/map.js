

maptilersdk.config.apiKey = mapToken;
 


       const map = new maptilersdk.Map({
      container: 'map',
      style: `https://api.maptiler.com/maps/streets/style.json?key=${mapToken}`,
      center: [77.1025, 28.7041],
      zoom: 9
    });

    const el = document.createElement('div');
el.className = 'custom-marker';
el.innerHTML ='<i class="fa-solid fa-house-signal fa-beat-fade" style="color: #e14b19; font-size:20px;"></i>'; // your custom icon path
 el.style.cursor = "pointer";
el.style.width = '40px';
el.style.height = '40px';
el.style.backgroundSize = 'cover';
el.style.backgroundRepeat = 'no-repeat';
el.style.borderRadius = '50%';
el.style.zIndex = "1";
const popup = new maptilersdk.Popup({
  offset: 25,
  closeButton: false,
  closeOnClick: false
}).setHTML(`
  <div style="
    background: linear-gradient(135deg, #ff9f43, #ff6b6b);
    color: white;
    padding: 10px 15px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    font-size: 14px;
    font-weight: 600;
    text-align: center;
  ">
   
    <span style="font-size:12px; opacity:0.8;">🏠 Exact Location provided after Booking</span>
  </div>
`)

el.addEventListener('mouseenter', () => popup.addTo(map).setLngLat(coordinates));
el.addEventListener('mouseleave', () => popup.remove());

map.flyTo({
  center: coordinates,
  zoom: 12,
  speed: 0.8
});
map.addControl(new maptilersdk.NavigationControl());
const marker=new maptilersdk.Marker({element:el,anchor: 'bottom'}).setLngLat(coordinates).addTo(map);
map.fitBounds([coordinates, coordinates], {
  padding: 100,
  maxZoom: 14,
});

