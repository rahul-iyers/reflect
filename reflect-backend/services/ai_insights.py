"""
AI-powered insights generation using Anthropic's Claude API
"""
import os
from anthropic import Anthropic
from datetime import datetime, timedelta


def generate_morning_insights(goals, yesterday_reflection):
    """
    Generate personalized morning insights based on user's goals and yesterday's reflection.

    Args:
        goals: List of active goal objects with description and deadline
        yesterday_reflection: Reflection object from yesterday with summary, accomplishments, improvements_to_make

    Returns:
        List of insight dictionaries with type, title, message, color
    """
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        # Return default insights if no API key
        return _generate_default_insights(goals, yesterday_reflection)

    try:
        client = Anthropic(api_key=api_key)

        # Prepare context for Claude
        context = _build_context(goals, yesterday_reflection)

        # Call Claude API
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": f"""You are a supportive personal growth coach. Based on the user's goals and yesterday's reflection, generate 2-3 personalized morning insights to help them start their day with intention.

{context}

Generate 2-3 insights as a JSON array. Each insight should have:
- "type": one of "goal", "improvement", "motivation", "reflection"
- "title": A short, encouraging title (3-6 words)
- "message": A specific, actionable message (1-2 sentences, max 150 characters)
- "color": one of "blue", "sky", "indigo" (for morning theme)

Focus on:
1. Urgent or important goals
2. Yesterday's intention to improve
3. Patterns or progress from their reflection
4. Actionable next steps

Keep the tone warm, encouraging, and specific to their situation. Return ONLY the JSON array, no other text.

Example format:
[
  {{"type": "goal", "title": "Focus on Key Priority", "message": "Your project deadline is in 3 days. Block 2 hours today for focused work.", "color": "blue"}},
  {{"type": "improvement", "title": "Build on Yesterday", "message": "You wanted to improve your morning routine. Start with just 5 minutes of planning.", "color": "sky"}}
]"""
            }]
        )

        # Parse Claude's response
        import json
        insights_text = message.content[0].text.strip()
        # Remove markdown code blocks if present
        if insights_text.startswith('```'):
            insights_text = insights_text.split('```')[1]
            if insights_text.startswith('json'):
                insights_text = insights_text[4:]

        insights = json.loads(insights_text)

        # Add icons for each insight type
        icon_map = {
            'goal': 'Target',
            'improvement': 'TrendingUp',
            'motivation': 'Sparkles',
            'reflection': 'Lightbulb'
        }

        for insight in insights:
            insight['icon'] = icon_map.get(insight.get('type', 'motivation'), 'Sparkles')

        return insights

    except Exception as e:
        print(f"Error generating AI insights: {e}")
        # Fallback to default insights
        return _generate_default_insights(goals, yesterday_reflection)


def _build_context(goals, yesterday_reflection):
    """Build context string for Claude"""
    context_parts = []

    # Add goals context
    if goals and len(goals) > 0:
        context_parts.append("USER'S ACTIVE GOALS:")
        for goal in goals[:5]:  # Limit to top 5 goals
            goal_text = f"- {goal['description']}"
            if goal.get('deadline'):
                deadline = goal['deadline']
                if isinstance(deadline, str):
                    deadline_date = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                else:
                    deadline_date = deadline

                today = datetime.now()
                days_until = (deadline_date.date() - today.date()).days

                if days_until < 0:
                    goal_text += f" (OVERDUE by {abs(days_until)} days)"
                elif days_until == 0:
                    goal_text += " (DUE TODAY)"
                elif days_until <= 7:
                    goal_text += f" (Due in {days_until} days)"
                else:
                    goal_text += f" (Deadline: {deadline_date.strftime('%B %d')})"

            context_parts.append(goal_text)
    else:
        context_parts.append("USER'S ACTIVE GOALS: None yet")

    context_parts.append("")

    # Add yesterday's reflection context
    if yesterday_reflection:
        context_parts.append("YESTERDAY'S REFLECTION:")
        if yesterday_reflection.get('summary'):
            context_parts.append(f"Day summary: {yesterday_reflection['summary']}")
        if yesterday_reflection.get('accomplishments'):
            context_parts.append(f"Accomplishments: {yesterday_reflection['accomplishments']}")
        if yesterday_reflection.get('improvements_to_make'):
            context_parts.append(f"Wanted to improve: {yesterday_reflection['improvements_to_make']}")
    else:
        context_parts.append("YESTERDAY'S REFLECTION: No reflection from yesterday")

    return "\n".join(context_parts)


def _generate_default_insights(goals, yesterday_reflection):
    """Generate simple rule-based insights as fallback"""
    insights = []

    # Goal-based insight
    if goals and len(goals) > 0:
        urgent_goals = []
        for goal in goals:
            if goal.get('deadline'):
                deadline = goal['deadline']
                if isinstance(deadline, str):
                    deadline_date = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                else:
                    deadline_date = deadline

                days_until = (deadline_date.date() - datetime.now().date()).days
                if 0 <= days_until <= 7:
                    urgent_goals.append((goal, days_until))

        if urgent_goals:
            goal, days = urgent_goals[0]
            insights.append({
                'type': 'goal',
                'icon': 'Target',
                'title': 'Focus on Urgent Goal',
                'message': f"Your goal '{goal['description'][:50]}...' is due in {days} day{'s' if days != 1 else ''}.",
                'color': 'blue'
            })
        else:
            goal = goals[0]
            insights.append({
                'type': 'goal',
                'icon': 'Target',
                'title': 'Make Progress Today',
                'message': f"Take one step toward: {goal['description'][:60]}...",
                'color': 'sky'
            })

    # Yesterday's improvement insight
    if yesterday_reflection and yesterday_reflection.get('improvements_to_make'):
        improvement = yesterday_reflection['improvements_to_make']
        insights.append({
            'type': 'improvement',
            'icon': 'TrendingUp',
            'title': "Yesterday's Intention",
            'message': f"You wanted to improve: {improvement[:80]}...",
            'color': 'sky'
        })

    # Motivational insight
    insights.append({
        'type': 'motivation',
        'icon': 'Sparkles',
        'title': 'Start Strong',
        'message': 'Small, consistent actions lead to big results. Make today count!',
        'color': 'indigo'
    })

    return insights
