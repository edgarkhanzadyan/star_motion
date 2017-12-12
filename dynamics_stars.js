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
    ctx.arc(this.x / 1e11 * 50, this.y / 1e11 * 50, this.mass / 1e34 * 5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
	}
};
const array_of_stars = [
	{
		color: `rgb(${gen_color()}, ${gen_color()}, ${gen_color()})`,
		mass: 4e34,
		x: 1e11,
		y: 5e11,
		x_vel: 0,
		y_vel: -4e6
	},
	{
		color: `rgb(${gen_color()}, ${gen_color()}, ${gen_color()})`,
		mass: 2e34,
		x: 2e11,
		y: 5e11,
		x_vel: 0,
		y_vel: 4e6
	},
	{
		color: `rgb(${gen_color()}, ${gen_color()}, ${gen_color()})`,
		mass: 2e34,
		x: 3e11,
		y: 5e11,
		x_vel: 0,
		y_vel: 4e6
	},
	{
		color: `rgb(${gen_color()}, ${gen_color()}, ${gen_color()})`,
		mass: 4e34,
		x: 4e11,
		y: 5e11,
		x_vel: 0,
		y_vel: -4e6
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
		x: -(summedForce.x / current_star.mass),
		y: -(summedForce.y / current_star.mass)
	};

	return acceleration;
}

const rk4 = (star_id, dt) => {
	const current_star = array_of_stars.filter((_, i) => i === star_id)[0];
	const x = current_star.x;
	const y = current_star.y;
	const vx = current_star.x_vel;
	const vy = current_star.y_vel;
	
	// const coordFunc = (x, v, a, dt) => x + (v * dt) + (a * (dt**2) / 2);
	// const velocityFunc = (v, a, dt) => v + a * dt;
	const _x1 = vx;
	const _y1 = vy;
	const { x: ax1, y: ay1 } = getAcceleration(star_id);
	const _vx1 = ax1;
	const _vy1 = ay1;

	const _x2 = vx + _x1 * (dt / 2);
	const _y2 = vy + _y1 * (dt / 2);
	const { x: ax2, y: ay2 } = getAcceleration(star_id);
	const _vx2 = ax2 + _vx1 * (dt / 2);
	const _vy2 = ay2 + _vy1 * (dt / 2);

  const _x3 = vx + _x2 * (dt / 2);
	const _y3 = vy + _y2 * (dt / 2);
	const { x: ax3, y: ay3 } = getAcceleration(star_id);
	const _vx3 = ax3 + _vx2 * (dt / 2);
	const _vy3 = ay3 + _vy2 * (dt / 2);

	const _x4 = vx + _x3 * (dt);
	const _y4 = vy + _y3 * (dt);
	const { x: ax4, y: ay4 } = getAcceleration(star_id);
	const _vx4 = ax4 + _vx3 * (dt);
	const _vy4 = ay4 + _vy3 * (dt);

	const xf = x + (dt/6)*(_x1 + 2*_x2 + 2*_x3 + _x4);
	const yf = y + (dt/6)*(_y1 + 2*_y2 + 2*_y3 + _y4);
	const vxf = vx + (dt/6)*(_vx1 + 2*_vx2 + 2*_vx3 + _vx4);
	const vyf = vy + (dt/6)*(_vy1 + 2*_vy2 + 2*_vy3 + _vy4);
	
	return { xf, yf, vxf, vyf };
}
function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (star_id_str in array_of_stars) {
		const star_id = parseInt(star_id_str);
		const result = rk4(star_id, FRAME_MILLISECONDS / 3);
		array_of_stars[star_id].x = result.xf;
		array_of_stars[star_id].y = result.yf;
		array_of_stars[star_id].x_vel = result.vxf;
		array_of_stars[star_id].y_vel = result.vyf;
	}
	array_of_stars.forEach((s) => {
		s.draw();
	})

}
intervalId = setInterval(
	() => raf = window.requestAnimationFrame(draw),
	FRAME_MILLISECONDS
);