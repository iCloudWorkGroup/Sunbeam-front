import extend from '../util/extend';
import * as types from '../store/action-types';
import parseLabel from '../tools/parseLabel';

export default function(sbm, store) {
	let font = {
		setFillColor(sheetId, color, label) {
			parseLabel(label, store, function(info) {
				info.props = {
					content: {
						background: color
					}
				}
				store.dispatch(types.CELLS_UPDATE, info);
			});
		}
	};
	extend(sbm, font);
}