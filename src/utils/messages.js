const generateMessage = ({ text, userName }) => {
  return {
    userName,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateJoinLeftMessage = (text) => {
  return {
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = ({
  userName,
  latitude,
  longitude,
  googleMapLinkString,
  openStreetMapLinkString,
  createdAt,
}) => {
  return {
    userName,
    latitude,
    longitude,
    googleMapLinkString,
    openStreetMapLinkString,
    googleMapEmbeddLink: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3418.3919669971315!2d${latitude}!3d${longitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDAyJzM1LjUiTiAzMcKwMjInMzEuNSJF!5e0!3m2!1sen!2seg!4v1634141139930!5m2!1sen!2seg`,
    openStreetMapLinkEmbeddLink: `https://www.openstreetmap.org/export/embed.html?bbox=${
      longitude + 0.0034493207931483028
    }%2C${latitude + 0.0015305204598803357}%2C${
      longitude - 0.003449320793155408
    }%2C${
      latitude - 0.0015304958526165535
    }&amp;layer=mapnik&amp;marker=${latitude}%2C${longitude}`,
    createdAt,
  };
};
//  openStreetMapLinkEmbeddLink cooredention calculation
//  31.37497365474701  -  31.37152433395386
//  31.37497365474701  -  31.378422975540165
//   31.04317232616026 - 31.04164180570038
//   31.04317232616026 - 31.044702822012876
module.exports = {
  generateJoinLeftMessage,
  generateMessage,
  generateLocationMessage,
};
