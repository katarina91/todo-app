var cryptojs = require('crypto-js');


module.exports = function (sequelize, DataTypes) {
	return sequelize.define('token', {
		token: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			varlidate: {
				len: [1]
			},
			set: function (value) {
				var hash = cryptojs.MD5(value).toString();
			
				this.setDataValue('token', value);
				this.setDataValue('tokenHash', hash);
			}
		},
		tokenHash: DataTypes.STRING

	});
}
