import L from 'leaflet';
import _ from 'lodash';

export const createCustomMarker = (color: string, name: string, hr?: number | null) => {
	const shortName = name.split(' ')[0];
	const formattedName = hr
		? `${_.startCase(shortName)} (HR: ${hr})`
		: _.startCase(shortName);

	const html = `
    <div style="position: relative; width: 0; height: 0;">
      <div style="position: absolute; left: 0px; bottom: 0px; width: 100px; height: 30px; z-index: 11; overflow: visible; pointer-events: auto; cursor: pointer;">
        <svg width="100" height="30" style="position: absolute; bottom: 0; left: 0; overflow: visible;">
          <path d="M 0 30 L 15 15 L 100 15" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div style="position: absolute; bottom: 17px; left: 17px; color: black; font-size: 12px; font-weight: 400; font-family: sans-serif; white-space: nowrap; line-height: 1; text-shadow: 1.5px 1.5px 0px white, -1.5px -1.5px 0px white, 1.5px -1.5px 0px white, -1.5px 1.5px 0px white, 0px 1.5px 0px white, 0px -1.5px 0px white, 1.5px 0px 0px white, -1.5px 0px 0px white;">
          ${formattedName}
        </div>
      </div>
    </div>
  `;

	return L.divIcon({
		className: 'bg-transparent border-none overflow-visible',
		html,
		iconSize: [0, 0],
		iconAnchor: [0, 0],
	});
};
