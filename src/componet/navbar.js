import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
	return (
		<nav className="navbar navbar-light bg-secondary">
			<div className="container d-flex justify-content-between">
				<Link className="text-decoration-none" to="/">
					<span className="navbar-brand mb-0 h1">Vehicle Maintenance Alert</span>
				</Link>
			</div>
		</nav>
	);
};
