export class LinterResult {
	line 	 	 : number;
	column 	 : number;
	filename : string;
	message  : string;
	type 		 : string;

	private _re = /\[(.*)\](.*)\((.*)\, line (\d)\, col (\d)\)/g;

	constructor(message : string, format="string") {
		this.parse(message, format);
	}

	parse(message : string, format="string") {
		var result = this._re.exec(message);

		console.log(result);

		this.type = result[1];
		this.message = result[2];
		this.filename = result[3];
		this.line = parseInt(result[4]);
		this.column = parseInt(result[5]);
	}
}