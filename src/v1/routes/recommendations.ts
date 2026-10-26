import { Router } from 'express';
import authMiddleware from '../../utils/AuthMiddleware.js';
import IaProvider from '../../utils/IaProveiders/Provider.js';
import { getUserInfo } from '../../utils/tokens.js';
import { getAllMedia } from '../../db/mongo.js';
import { getPosters } from '../../utils/Posters.js';
import { limitRecommendationsPerType, parseRecommendations } from '../../utils/recommendations.js';

const router = Router();

router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error('Secret key is not defined.');
      res.status(500).json({ message: 'Server configuration error.' });
      return;
    }

    const token = req.headers.authorization?.split(' ')[1];
    const payload = getUserInfo(token!, secretKey);
    if (!payload) {
      res.status(401).json({ message: 'Auth Token no valid' });
      return;
    }

    const { results } = await getAllMedia(payload.user.id);
    if (!results.data || results.data.length === 0) {
      res.status(400).json({ message: 'No media history available for recommendations.' });
      return;
    }

    let response: string | null = null;
    try {
      response = await IaProvider.getRecommendation(results.data);
    } catch (error) {
      console.error('Recommendation provider failed:', error);
      res.status(502).json({ message: 'Recommendation service unavailable.' });
      return;
    }

    if (!response) {
      res.status(502).json({ message: 'Recommendation service returned no data.' });
      return;
    }

    const parsed = parseRecommendations(response);
    if (!parsed) {
      res.status(502).json({ message: 'Recommendation service returned invalid data.' });
      return;
    }

    const withPosters = await getPosters(parsed);
    const recommendations = limitRecommendationsPerType(
      withPosters.filter((item) => typeof item.poster === 'string' && item.poster.length > 0)
    );

    res.send(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Unable to generate recommendations.' });
  }
});

export default router;
