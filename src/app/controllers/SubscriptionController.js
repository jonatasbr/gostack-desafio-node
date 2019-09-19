import { Op } from 'sequelize';
import * as Yup from 'yup';

import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

import Mail from '../../lib/Mail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          where: {
            date: { [Op.gt]: new Date() },
          },
          required: true,
        },
      ],
      order: [['meetup', 'date', 'asc']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      meetupId: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res
        .status(400)
        .json({ error: 'Id of the meetup should be number' });
    }

    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          as: 'user',
          required: true,
          attributes: ['name', 'email'],
        },
      ],
    });
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id === req.userId) {
      return res
        .status(400)
        .json({ error: "Can't subscribe for the meetup that you own" });
    }

    if (meetup.past) {
      return res.status(400).json({
        error: "Can't subscribe in meetups that have already happened",
      });
    }

    const user = await User.findByPk(req.userId);
    const signUp = await Subscription.findOne({
      where: {
        user_id: user.id,
        meetup_id: meetup.id,
      },
    });
    if (signUp) {
      return res.status(401).json({
        error: 'User is already subscribed',
      });
    }

    const verifyDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });
    if (verifyDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: `Nova inscrição || ${meetup.title}`,
      template: 'subscription',
      context: {
        owner: meetup.user.name,
        meetup: meetup.title,
        user: user.name,
        email: user.email,
      },
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
