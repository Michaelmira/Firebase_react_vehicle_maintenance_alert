import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
	return (
		<nav className="navbar navbar-light bg-secondary">
			<div className="container d-flex justify-content-between">
				<Link className="text-decoration-none" to="/">
					<span className="navbar-brand mb-0 h1">Vehicle Maintenance Alert</span>
				</Link>

				<div>
					<div className="dropdown">
						<button className="btn btn-secondary text-black text-bold dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
							Dropdown button
						</button>
						<ul className="dropdown-menu">
							<li><a className="dropdown-item" href="#">Action</a></li>
							<li><a className="dropdown-item" href="#">Another action</a></li>
							<li><a className="dropdown-item" href="#">Something else here</a></li>
						</ul>
					</div>

				</div>

			</div>
		</nav>
	);
};
