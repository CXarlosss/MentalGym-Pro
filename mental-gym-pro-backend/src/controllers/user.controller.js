/* import User from "../models/user/User.js";

// @desc   Obtener perfil del usuario autenticado
// @route  GET /api/users/me
// @access Privado
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener perfil", error });
  }
};

// @desc   Editar perfil del usuario
// @route  PUT /api/users/update-profile
// @access Privado
export const updateProfile = async (req, res) => {
  const { username, email, avatar } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.username = username || user.username;
    user.email = email || user.email;
    user.avatar = avatar || user.avatar;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar perfil", error });
  }
};

// @desc   Seguir o dejar de seguir a otro usuario
// @route  POST /api/users/follow/:id
// @access Privado
export const toggleFollowUser = async (req, res) => {
  const userToFollowId = req.params.id;

  try {
    const currentUser = await User.findById(req.user._id);
    const userToFollow = await User.findById(userToFollowId);

    if (!userToFollow) {
      return res.status(404).json({ message: "Usuario a seguir no encontrado" });
    }

    const alreadyFollowing = currentUser.following.includes(userToFollowId);

    if (alreadyFollowing) {
      currentUser.following.pull(userToFollowId);
      userToFollow.followers.pull(req.user._id);
    } else {
      currentUser.following.push(userToFollowId);
      userToFollow.followers.push(req.user._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ following: !alreadyFollowing });
  } catch (error) {
    res.status(500).json({ message: "Error al seguir usuario", error });
  }
};

// @desc   Obtener perfil público de otro usuario
// @route  GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuario", error });
  }
};
 */