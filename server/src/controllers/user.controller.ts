import { OK, UNAUTHORIZED } from '../constant/http';
import UserModel from '../models/user.model';
import { updateUserSchema } from '../schemas/user.schema';
import CustomResponse from '../utils/response';
import { asyncHandler } from '../utils/utils';

/**
 * @route PATCH /api/v1/user - Update current user's profile
 */
export const updateProfileHandler = asyncHandler(async (req, res) => {
	const user = req.user;
	const body = updateUserSchema.parse(req.body);

	user.name = body.name;
	user.email = body.email;
	if (body.phone !== undefined) {
		const num = Number(body.phone);
		user.phone = isNaN(num) ? body.phone : num;
	}

	await user.save();

	res
		.status(OK)
		.json(new CustomResponse(true, user.omitPassword(), 'Profile updated'));
});

/**
 * @route GET /api/v1/user/search?q=<query>
 * Search users by name or email (for admin add-participant flow)
 */
export const searchUsersHandler = asyncHandler(async (req, res) => {
	const { q } = req.query;

	if (!q || typeof q !== 'string' || q.trim().length < 2) {
		res.json(new CustomResponse(true, [], 'No results'));
		return;
	}

	const regex = new RegExp(q.trim(), 'i');

	const users = await UserModel.find({
		$or: [
			{ name: regex },
			{ email: regex },
		],
		archived: { $ne: true },
	})
		.select('-password')
		.limit(10)
		.lean();

	res.json(new CustomResponse(true, users, 'Users found'));
});
