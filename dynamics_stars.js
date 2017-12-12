const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
// const answer = document.getElementById('answer');
// const time = document.getElementById('time');

const
	FRAME_MILLISECONDS = 1000 / 60,
	G = 6.673e-11,
	exampleStarData = [
		{
			mass: 2,
			xCoord: 1,
			yCoord: 2,
			xVel: 0,
			yVel: -1
		},
		{
			mass: 1,
			xCoord: 2,
			yCoord: 2,
			xVel: 0,
			yVel: -2
		},
		{
			mass: 1,
			xCoord: 3,
			yCoord: 2,
			xVel: 0,
			yVel: 2
		},
		{
			mass: 2,
			xCoord: 4,
			yCoord: 2,
			xVel: 0,
			yVel: 1
		},
	];

const gen_color = () => Math.round(Math.random() * 255);

const countDistance = (x1, y1, x2, y2) => Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
const getAcceleration = (starId, arrayOfStars) => {
	const currentStar = arrayOfStars.filter((_, i) => i === starId)[0];
	const otherStars = arrayOfStars.filter((_, i) => i !== starId);

	const allForces = otherStars.map((star) => {
		const distance = countDistance(currentStar.x, currentStar.y, star.x, star.y);
		const force = G * currentStar.mass * star.mass / (distance ** 2);
		const forceVector = {
			x: currentStar.x - star.x,
			y: currentStar.y - star.y,
		};
		const forceVectorCos = forceVector.x / distance;
		const forceVectorSin = forceVector.y / distance;

		const forceX = force * forceVectorCos;
		const forceY = force * forceVectorSin;

		return {
			forceX,
			forceY
		};
	});
	
	const reducer = (acc, curValue) => {
		return {
			x: acc.x + curValue.forceX,
			y: acc.y + curValue.forceY
		};
	};

	const summedForce = allForces.reduce(reducer, { x: 0, y: 0 });

	const acceleration = {
		x: -(summedForce.x / currentStar.mass),
		y: -(summedForce.y / currentStar.mass)
	};

	return acceleration;
}
const rk4 = (starId, arrayOfStars, dt) => {
	const currentStar = arrayOfStars.filter((_, i) => i === starId)[0];
	const x = currentStar.x;
	const y = currentStar.y;
	const vx = currentStar.xVel;
	const vy = currentStar.yVel;
	
	// const coordFunc = (x, v, a, dt) => x + (v * dt) + (a * (dt**2) / 2);
	// const velocityFunc = (v, a, dt) => v + a * dt;
	const _x1 = vx;
	const _y1 = vy;
	const { x: ax1, y: ay1 } = getAcceleration(starId, arrayOfStars);
	const _vx1 = ax1;
	const _vy1 = ay1;

	const _x2 = vx + _x1 * (dt / 2);
	const _y2 = vy + _y1 * (dt / 2);
	const { x: ax2, y: ay2 } = getAcceleration(starId, arrayOfStars);
	const _vx2 = ax2 + _vx1 * (dt / 2);
	const _vy2 = ay2 + _vy1 * (dt / 2);

	const _x3 = vx + _x2 * (dt / 2);
	const _y3 = vy + _y2 * (dt / 2);
	const { x: ax3, y: ay3 } = getAcceleration(starId, arrayOfStars);
	const _vx3 = ax3 + _vx2 * (dt / 2);
	const _vy3 = ay3 + _vy2 * (dt / 2);

	const _x4 = vx + _x3 * (dt);
	const _y4 = vy + _y3 * (dt);
	const { x: ax4, y: ay4 } = getAcceleration(starId, arrayOfStars);
	const _vx4 = ax4 + _vx3 * (dt);
	const _vy4 = ay4 + _vy3 * (dt);

	const xf = x + (dt/6)*(_x1 + 2*_x2 + 2*_x3 + _x4);
	const yf = y + (dt/6)*(_y1 + 2*_y2 + 2*_y3 + _y4);
	const vxf = vx + (dt/6)*(_vx1 + 2*_vx2 + 2*_vx3 + _vx4);
	const vyf = vy + (dt/6)*(_vy1 + 2*_vy2 + 2*_vy3 + _vy4);
	
	return { xf, yf, vxf, vyf };
}
const runAnimation = () => {
	const
		starDt = parseFloat(document.getElementsByClassName('dt')[0].value),
		starMasses = Array.from(document.getElementsByClassName('mass')),
		starsXCoords = Array.from(document.getElementsByClassName('xCoord')),
		starsYCoords = Array.from(document.getElementsByClassName('yCoord')),
		starsXVelocity = Array.from(document.getElementsByClassName('xVel')),
		starsYVelocity = Array.from(document.getElementsByClassName('yVel'));
		// check variables
		for (i in starMasses) {
			if (
				isNaN(parseFloat(starMasses[i].value)) ||
				isNaN(parseFloat(starsXCoords[i].value)) ||
				isNaN(parseFloat(starsYCoords[i].value)) ||
				isNaN(parseFloat(starsXVelocity[i].value)) ||
				isNaN(parseFloat(starsYVelocity[i].value)) ||
				isNaN(starDt)
			) {
				document.getElementsByClassName('wrongInputs')[0].innerHTML = "!!!!!Wrong Inputs!!!!!";
				return;
			}
		}

		// animation frame instance
		let raf;
		// interval instance
		let intervalId;
		document.getElementsByClassName('wrongInputs')[0].innerHTML = "";
		const animationButton = document.getElementsByClassName('animationButton')[0];
		animationButton.innerHTML = 'Stop Animation!';
		animationButton.onclick = () => {
			animationButton.innerHTML = 'Run Animation!';
			animationButton.onclick = runAnimation;
			document.getElementsByClassName('animationButtonDefaultValues')[0].style.visibility = 'visible';
			clearInterval(intervalId);
			window.cancelAnimationFrame(raf);
		};
		document.getElementsByClassName('animationButtonDefaultValues')[0].style.visibility = 'hidden';

		const arrayOfStars = starMasses.map((_, i) => {
			const 
				mass = parseFloat(starMasses[i].value),
				xCoord = parseFloat(starsXCoords[i].value),
				yCoord = parseFloat(starsYCoords[i].value),
				xVel = parseFloat(starsXVelocity[i].value),
				yVel = parseFloat(starsYVelocity[i].value);
			return {
				color: `rgb(${gen_color()}, ${gen_color()}, ${gen_color()})`,
				mass: mass * 1e34, // mass: 4e34,
				x: (xCoord + 1) * 1e11, // x: 1e11,
				y: (yCoord + 3) * 1e11, // y: 5e11,
				xVel: xVel * 1e6, // xVel: 0
				yVel: yVel * 1e6, // yVel: -4e6
				draw: function() {
					// draw start
					ctx.beginPath();
					ctx.arc(this.x / 1e11 * 50, this.y / 1e11 * 50, this.mass / 1e34 * 5, 0, Math.PI * 2, true);
					ctx.closePath();
					ctx.fillStyle = this.color;
					ctx.fill();
				}
			}
		});
		
		function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (starIdStr in arrayOfStars) {
				const starId = parseInt(starIdStr);
				const result = rk4(starId, arrayOfStars, starDt);
				arrayOfStars[starId].x = result.xf;
				arrayOfStars[starId].y = result.yf;
				arrayOfStars[starId].xVel = result.vxf;
				arrayOfStars[starId].yVel = result.vyf;
			}
			arrayOfStars.forEach((s) => {
				s.draw();
			})
		}
		intervalId = setInterval(
			() => raf = window.requestAnimationFrame(draw),
			FRAME_MILLISECONDS
		);
}
const addStar = starData => {
	const starForm = document.createElement("form");
	starForm.className = "starForm";
	const textNodes = [
		"Mass * 1e34: ",
		"X Coordinate * 1e11: ",
		"Y Coordinate * 1e11: ",
		"Velocity projection on X * 1e6: ",
		"Velocity projection on Y * 1e6: "
	];
	const inputClasses = ['mass','xCoord','yCoord','xVel','yVel'];
	const texts = textNodes.map(textName => document.createTextNode(textName));
	const inputs = inputClasses.map((inputName) => {
		const domElement = document.createElement('input');
		domElement.className = inputName;
		if (starData && starData[inputName] !== undefined) {
			domElement.value = starData[inputName];
		}
		return domElement;
	});
	const insertInForm = inputClasses.map((_, i) => {
		starForm.appendChild(texts[i]);
		starForm.appendChild(inputs[i]);
		starForm.appendChild(document.createElement("br"));
	});
	const starContainer = document.getElementsByClassName('starContainer')[0];
	const deleteButton = document.createElement("button");
	deleteButton.innerHTML = "delete star";
	deleteButton.setAttribute("type", "button");
	deleteButton.onclick = () => {
		const stars = document.getElementsByClassName('starForm');
		if (stars.length > 1) {
			starContainer.removeChild(starForm);
		}
	}
	starForm.appendChild(deleteButton);
	starContainer.appendChild(starForm);
	return starForm;
}
const runWithDefaultValues = () => {
	const starsContainer = document.getElementsByClassName('starContainer')[0];
	const dt = document.getElementsByClassName('dt')[0];
	dt.value = FRAME_MILLISECONDS / 3;
	const stars = Array.from(document.getElementsByClassName('starForm'));
	stars.forEach((star) => {
		starsContainer.removeChild(star);
	});
	exampleStarData.forEach((starData) => {
		const star = addStar(starData);
	});
	runAnimation();
}
document.getElementsByClassName('animationButton')[0].onclick = runAnimation;
document.getElementsByClassName('addStarButton')[0].onclick = addStar;
document.getElementsByClassName('animationButtonDefaultValues')[0].onclick = runWithDefaultValues;
addStar();