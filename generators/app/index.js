const Generator = require("yeoman-generator");
class appGenerator extends Generator {
	constructor(args, opts) {
		super(args, opts);
	}
	async prompting() {
		const answers = await this.prompt([
			{
				type: "input",
				name: "name",
				message: "Your project name",
				default: this.appname,
			},
			{
				type: "confirm",
				name: "module",
				message: "Would you like to use ECMAScript modules?",
			},
			{
				type: "confirm",
				name: "eslint",
				message: "Would you like to enable ESLint?",
			},
			{
				type: "confirm",
				name: "prettier",
				message: "Would you like to enable Prettier?",
			},
		]);
		this.appname = answers.name;
		this.eslint = answers.eslint;
		this.prettier = answers.prettier;
		this.module = answers.module;
	}
	async secondPrompting() {
		if (this.prettier) {
			const answers = await this.prompt([
				{
					type: "confirm",
					name: "useTabs",
					message: "Use tabs?",
					default: true,
				},
				{
					type: "number",
					name: "size",
					message: "What width of tabulation?",
					default: 2,
				},
				{
					type: "confirm",
					name: "singleQuote",
					message: "Should use single quote?",
					default: false,
				},
			]);
			this.useTabs = answers.useTabs;
			this.tabSize = answers.size;
			this.singleQuote = answers.singleQuote;
		}
	}
	write() {
		this.fs.copyTpl(
			this.templatePath("index.html"),
			this.destinationPath("src/page/index.html"),
			{
				title: this.appname,
				type: this.module ? "module" : "application/javascript",
			}
		);
		this.fs.copyTpl(
			this.templatePath("index.css"),
			this.destinationPath("src/page/index.css")
		);
		this.fs.copyTpl(
			this.templatePath("index.ts"),
			this.destinationPath("src/ts/index.ts")
		);
		this.fs.copyTpl(
			this.templatePath("gulpfile.js"),
			this.destinationPath("gulpfile.js")
		);
		this.fs.copyTpl(
			this.templatePath("tsconfig.json"),
			this.destinationPath("tsconfig.json")
		);
	}
	configFiles() {
		if (this.eslint) {
			this.fs.copyTpl(
				this.templatePath(".eslintrc"),
				this.destinationPath("src/.eslintrc")
			);
		}
		if (this.prettier) {
			this.fs.extendJSON(this.destinationPath(".prettierrc"), {
				useTabs: this.useTabs,
				tabWidth: this.tabSize,
				singleQuote: this.singleQuote,
			});
		}
	}
	init() {
		const pkgJson = {
			name: this.appname,
			description: this.description,
		};
		this.fs.extendJSON(this.destinationPath("package.json"), pkgJson);
	}
	installBasic() {
		this.addDevDependencies({
			"browser-sync": "^2.26.14",
			"gulp": "^4.0.2",
			"gulp-changed": "^4.0.2",
			"gulp-replace": "^1.1.1",
			"gulp-typescript": "*",
			"typescript": "^4.2.4",
		});
	}
	installESLint() {
		if (!this.eslint) {
			return;
		}
		this.addDevDependencies({
			"@typescript-eslint/eslint-plugin": "^4.21.0",
			"@typescript-eslint/parser": "^4.21.0",
			"eslint": "^7.24.0",
		});
	}
	installPrettier() {
		if (!this.prettier) {
			return;
		}
		this.addDevDependencies({
			prettier: "^2.3.0",
		});
	}
	installPrettierESLint() {
		if (!(this.prettier && this.eslint)) {
			return;
		}
		this.addDevDependencies({
			"eslint-config-prettier": "^8.3.0",
		});
		this.fs.extendJSON(this.destinationPath("src/.eslintrc"), {
			extends: [
				"eslint:recommended",
				"prettier",
				"plugin:@typescript-eslint/recommended",
			],
		});
	}
	initGulp() {
		this.on("end", () => {
			this.spawnCommand("gulp", ["init"]);
		});
	}
}

module.exports = appGenerator;
