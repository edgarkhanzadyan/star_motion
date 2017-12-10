const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const answer = document.getElementById('answer');
const time = document.getElementById('time');

const
	FRAME_MILLISECONDS = 1000 / 60,
	NUMBER_OF_STARS = 4,
	MASSES = [1, 2, 3, 4],
	X_COORDS = [50, 100, 150, 200],
	Y_COORDS = [250, 250, 250, 250],
	X_VELOCITY = [0, 0, 0, 0],
	Y_VELOCITY = [0, 0, 0, 0],
	G = 6.673e-11;

const gen_color = () => Math.round(Math.random() * 255);
const star = {
	draw: function() {
		// draw start
		ctx.beginPath();
    ctx.arc(this.x / 1e11 * 50, this.y / 1e11 * 50, this.mass / 1e30 * 5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
	}
};
const options = {
	millisecondsFromStart: 0
};
const array_of_stars = [
	{
		color: `rgb(${gen_color()}, ${gen_color()}, ${gen_color()})`,
		mass: 1e30,
		x: 1e11,
		y: 5e11,
		x_vel: 0,
		y_vel: 0
	},
	{
		color: `rgb(${gen_color()}, ${gen_color()}, ${gen_color()})`,
		mass: 2e30,
		x: 2e11,
		y: 5e11,
		x_vel: 0,
		y_vel: 0
	},
	{
		color: `rgb(${gen_color()}, ${gen_color()}, ${gen_color()})`,
		mass: 3e30,
		x: 3e11,
		y: 5e11,
		x_vel: 0,
		y_vel: 0
	},
	{
		color: `rgb(${gen_color()}, ${gen_color()}, ${gen_color()})`,
		mass: 4e30,
		x: 4e11,
		y: 5e11,
		x_vel: 0,
		y_vel: 0
	}
];
array_of_stars.map((s) => {
	Object.assign(s, star);
});
const countDistance = (x1, y1, x2, y2) => Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
const getAcceleration = (star_id) => {
	const current_star = array_of_stars.filter((_, i) => i === star_id)[0];
	const other_stars = array_of_stars.filter((_, i) => i !== star_id);

	const allForces = other_stars.map((star) => {
		const distance = countDistance(current_star.x, current_star.y, star.x, star.y);
		const force = G * current_star.mass * star.mass / (distance ** 2);
		const forceVector = {
			x: current_star.x - star.x,
			y: current_star.y - star.y,
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
		x: summedForce.x / current_star.mass,
		y: summedForce.y / current_star.mass
	};

	return acceleration;
	// r = sqrt((x2 - x1)**2 + (y2 - y1)**2)
	// F = G * m1 * m2 / (r ** r)
	// a = (F1 + F2 + F3) / m
	// 
}

const rk4 = (star_id, dt) => {
  // Returns final (position, velocity) array after time dt has passed.
  //        x: initial position
  //        v: initial velocity
  //        a: acceleration function a(x,v,dt) (must be callable)
	//        dt: timestep
	const current_star = array_of_stars.filter((_, i) => i === star_id)[0];
	const x = current_star.x;
	const y = current_star.y;
	const vx = current_star.x_vel;
	const vy = current_star.y_vel;

	const x1 = x;
	const y1 = y;
	const vx1 = vx;
	const vy1 = vy;
	const { x: ax1, y: ay1 } = getAcceleration(star_id);

	const x2 = x + 0.5 * vx1 * dt;
	const y2 = y + 0.5 * vy1 * dt;
	const vx2 = vx1 + 0.5 * ax1 * dt;
	const vy2 = vy1 + 0.5 * ay1 * dt;
	const { x: ax2, y: ay2 } = getAcceleration(star_id);

  const x3 = x + 0.5 * vx2 * dt;
	const y3 = y + 0.5 * vy2 * dt;
	const vx3 = vx2 + 0.5 * ax2 * dt;
	const vy3 = vy2 + 0.5 * ay2 * dt;
	const { x: ax3, y: ay3 } = getAcceleration(star_id);

  const x4 = x + 0.5 * vx3 * dt;
	const y4 = y + 0.5 * vy3 * dt;
	const vx4 = vx3 + 0.5 * ax3 * dt;
	const vy4 = vy3 + 0.5 * ay3 * dt;
	const { x: ax4, y: ay4 } = getAcceleration(star_id);

	const xf = x + (dt/6)*(vx1 + 2*vx2 + 2*vx3 + vx4);
	const yf = y + (dt/6)*(vy1 + 2*vy2 + 2*vy3 + vy4);
	const vxf = vx + (dt/6)*(ax1 + 2*ax2 + 2*ax3 + ax4);
	const vyf = vy + (dt/6)*(ay1 + 2*ay2 + 2*ay3 + ay4);
	
	return { xf, yf, vxf, vyf };
}
const computeXcoord = (array_of_stars, star_id) => { return 5 * options.millisecondsFromStart / 1000 };
const computeYcoord = (array_of_stars, star_id) => { return 5 * options.millisecondsFromStart / 1000 };
const computeYvelocity = (array_of_stars, star_id) => { return 5 * options.millisecondsFromStart / 1000 };
const computeXvelocity = (array_of_stars, star_id) => { return 5 * options.millisecondsFromStart / 1000 };
function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	options.millisecondsFromStart += 50;
	for (star_id_str in array_of_stars) {
		const star_id = parseInt(star_id_str);
		// // console.log(array_of_stars[star_id]);
		const result = rk4(star_id, options.millisecondsFromStart);
		array_of_stars[star_id].x = result.xf;
		array_of_stars[star_id].y = result.yf;
		array_of_stars[star_id].x_vel = result.vxf;
		array_of_stars[star_id].y_vel = result.vyf;
		console.log(result.xf / 1e11);
	}
	array_of_stars.forEach((s) => {
		s.draw();
	})

}
intervalId = setInterval(
	() => raf = window.requestAnimationFrame(draw),
	FRAME_MILLISECONDS
);