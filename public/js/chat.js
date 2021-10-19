const socket = io(); // to recive events and send it

// elements
const messageForm = document.querySelector("#message-form");
const messageFormButton = messageForm.querySelector("button");
const messageFormInput = messageForm.querySelector("input");
const locationStatus = document.querySelector("#status");
const googleMapLink = document.querySelector("#google-map-link");
const openStreetMapLink = document.querySelector("#openstreet-map-link");
const sendYourLocationButton = document.querySelector("#send-your-location");
const messagesElement = document.querySelector("#messages");
const sidebar = document.querySelector("#sidebar");

// templates
const messageTempelate = document.querySelector("#message-template").innerHTML;
const sidebarTempelate = document.querySelector("#sidebar-template").innerHTML;
const locationTempelate =
  document.querySelector("#location-template").innerHTML;
const userTempelate = document.querySelector(
  "#joined-or-left-user-template"
).innerHTML;

// Options
const { userName, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
}); // to get the userName and room // the user entered

const autoscroll = () => {
  // messagesElement.scrollTop = messagesElement.scrollHeight;

  // New message element
  const $newMessage = messagesElement.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = messagesElement.offsetHeight;

  // Height of messagesElement container
  const containerHeight = messagesElement.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = messagesElement.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight - 100 <= scrollOffset) {
    messagesElement.scrollTop = messagesElement.scrollHeight;
  }
};

// execting methods when recive data from the server
const showMessageOnScreen = (content) => {
  const html = Mustache.render(messageTempelate, {
    userName: content.userName,
    message: content.text,
    createdAt: moment(content.createdAt).calendar(),
  });
  messagesElement.insertAdjacentHTML("beforeend", html);
  autoscroll();
};

const showLocationOnScreen = (locationData) => {
  const html = Mustache.render(locationTempelate, locationData);
  messagesElement.insertAdjacentHTML("beforeend", html);
  console.log(
    ` latitude: ${locationData.latitude}, longitude: ${locationData.longitude}`
  );
  autoscroll();
};

const showWhoJoinedOrLeftFromChat = (content) => {
  const html = Mustache.render(userTempelate, {
    data: `${content.text} ${moment(content.createdAt).format(
      " h:mm a  ddd Do/MMM/YYYY"
    )}`,
  });
  messagesElement.insertAdjacentHTML("beforeend", html);
  console.log(`server commed. ${content.text} , ${content.createdAt}`);
  autoscroll();
};

const showRoomData = ({ room, users }) => {
  const html = Mustache.render(sidebarTempelate, { room, users });
  sidebar.innerHTML = html;
};

// messages comes from server
// welcomeMessage >> matched the name in the server side (index.js)
socket.on("newUserEntered", showWhoJoinedOrLeftFromChat);
socket.on("userLeft", showWhoJoinedOrLeftFromChat);
socket.on("sendMessageFromServer", showMessageOnScreen);
socket.on("sendUserlocationToAllFromServer", showLocationOnScreen);
socket.on("roomData", showRoomData);

// the Input of the message
const onSubmit = (event) => {
  event.preventDefault();
  //   mainMessage.textContent = "Loading......";
  //   dataMessage.textContent = "";
  const value = messageForm.elements.message.value;
  messageFormButton.setAttribute("disabled", "disabled"); // disable button >> bo non clickabel

  socket.emit("sendMessageFromClient", value, (ack) => {
    //this method is for acknowlagement sent from server
    console.log(`message deleverd ${ack}`);
    messageFormButton.removeAttribute("disabled"); // remove the disable Attribute >> to bo clickabel again after sending the msg
    messageFormInput.value = ""; // remove it's value after click sending
    messageFormInput.focus(); // to put the cursor in the input again
  });
};
messageForm.addEventListener("submit", onSubmit);

// send device location to server
function geoFindMe() {
  googleMapLink.href = "";
  googleMapLink.textContent = "";

  openStreetMapLink.href = "";
  openStreetMapLink.textContent = "";

  function success(position) {
    sendYourLocationButton.setAttribute("disabled", "disabled"); //disable the button before sending the location
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    googleMapLinkString = `https://www.google.com/maps?q=${latitude},${longitude}`;
    googleMapLink.href = googleMapLinkString;
    googleMapLink.textContent = `googleMapLink: Latitude: ${latitude}°, Longitude: ${longitude}°`;

    openStreetMapLinkString = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    openStreetMapLink.href = openStreetMapLinkString;
    openStreetMapLink.textContent = `openStreetMapLink: Latitude: ${latitude}°, Longitude: ${longitude}°`;

    const createdAt = moment(new Date().getTime()).calendar();
    locationStatus.textContent = `Location Last Update: ${createdAt}`;

    //send location to server
    socket.emit(
      "sendLocationFromClient",
      {
        latitude,
        longitude,
        googleMapLinkString,
        openStreetMapLinkString,
        createdAt,
      },
      (ack) => {
        console.log(`Location status: ${ack.msg}`);
        sendYourLocationButton.removeAttribute("disabled"); // enable the button after sending the location >> so i removed the attribute disabled
      }
    );
  }

  function error(error) {
    locationStatus.textContent = `Unable to retrieve your location  ${error.message} `;
  }

  if (!navigator.geolocation) {
    locationStatus.textContent = "Geolocation is not supported by your browser";
  } else {
    locationStatus.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(success, error);
  }
}
sendYourLocationButton.addEventListener("click", geoFindMe);

socket.emit("join", { userName, room }, ({ ack, error }) => {
  //this method is for acknowlagement sent from server
  console.log(`ack: ${ack}`);
  if (error) {
    alert(error);
    location.href = "/"; // to switch the user to the root of website
  }
});
