Lunar Money Coding Style Guide--------------------------------------------------------------
General Principles

Readability > brevity — Code should be easy to read and understand.
Descriptive names — variables, functions, and classes should be descrpitive. 
    (except where conventional i.e. 'i' in for loops)
Err on the side of over-commenting — being overly descriptive is okay so that other
    team members can better understand your code.
Use 4 spaces for indentation. 
	(can turn on sticky tab stops in vsCode to treat them as tabs)

HTML Style ---------------------------------------------------------------------------------

Always use lowercase for tags and attributes.
Nested element's open and close tags line up.
Use double quotes for all attribute values.
Boolean attributes don’t need a value (e.g., disabled, checked).
Attribute order: id, class, src/href, alt, title, data-*.
Include a <!DOCTYPE html>.

ex: ~ ~ ~ ~ ~ ~ ~

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<title>Page Title</title>
	</head>
	<body>
		<header>
			<h1>Example Header</h1>
		</header>
		<main>
			<p>Page sample.</p>
		</main>
	</body>
</html>

~ ~ ~ ~ ~ ~ ~ ~ ~

CSS Style ----------------------------------------------------------------------------------

Use lowercase and hyphens for class and id names (e.g. .main-header, not .MainHeader).
Include a space after colons and commas.
Prefer class selectors over element or ID selectors.
Group related rules together.
No inline styles in HTML if avoidable.
Use CSS variables for repeated values.

ex: ~ ~ ~ ~ ~ ~ ~

body {
	background-color: #f9f9f9;
	color: #333;
}

.main-header {
	font-size: 2rem;
	margin-bottom: 1em;
}

.example-item {
	margin: 3, 4, 3, 0;
}

~ ~ ~ ~ ~ ~ ~ ~ ~

JavaScript Style ---------------------------------------------------------------------------

Use camelCase for variables and functions.
Use PascalCase for class names.
Always use const or let instead of var.
Control structures always use parens.
Use line terminating semicolons.
Use single quotes for strings.
Prefer smaller functions.
boolean values conditionals are context dependent
	!isRunning <-- do this
	isRunning !== true <-- or this
	isRunning === false <-- or this depending on what makes the most sense in context
Use meaningful names: getUserById() instead of getData().
Use strict equality (===) where applicable.
Prefer using template literals for string concatenation.

ex: ~ ~ ~ ~ ~ ~ ~

const greeting = 'Hello world';

function greetUser(name) {
	if(greetUser === true){
  		console.log(`${greeting}, ${name}!`);
  	}
}

class User {
  constructor(username) {
    this.username = username;
  }
}

~ ~ ~ ~ ~ ~ ~ ~ ~

Arrow functions can be used, but aren't strictly enforced for callbacks or short functions.
Array methods (map, filter, forEach) may be used instead of manual loops unless it would make
the code unclear.

ex: ~ ~ ~ ~ ~ ~ ~

const numbers = [1, 2, 3];
numbers.forEach(num => console.log(num * 2));

~ ~ ~ ~ ~ ~ ~ ~ ~

Git & File Naming --------------------------------------------------------------------------

Use lowercase-with-dashes and/or lowercase_with_underscores for file and folder names (mixing is okay).
Example: user-routes.js, app.css, routes-map_main.png
Commit messages should be short but descriptive:

ex: ~ ~ ~ ~ ~ ~ ~

add user login route
fix CSS alignment in header

 ~ ~ ~ ~ ~ ~ ~ ~ ~
