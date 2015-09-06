/* global VR */

VR.utils = {
	parseAttributeString: function(attribute, str) {
		var values;
		var value = str;
		if (attribute === 'position' ||
	  	  attribute === 'rotation' ||
	    	attribute === 'scale') {
			if (!str) { return null; }
			values = value.split(' ');
			if (values.length !== 3) {
				VR.error('attr string should be len 3, ex:  (0 1 2)');
			}
			value = {
        x: parseFloat(values[0]),
        y: parseFloat(values[1]),
        z: parseFloat(values[2])
      };
		}
		return value;
	}
};