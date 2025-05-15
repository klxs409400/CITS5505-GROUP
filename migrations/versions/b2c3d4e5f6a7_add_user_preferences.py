"""add user preferences

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2025-05-15 13:21:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to user table for preferences
    op.add_column('user', sa.Column('preferred_language', sa.String(length=10), nullable=True, server_default='en'))
    op.add_column('user', sa.Column('theme', sa.String(length=20), nullable=True, server_default='light'))
    op.add_column('user', sa.Column('notification_enabled', sa.Boolean(), nullable=True, server_default='1'))
    op.add_column('user', sa.Column('weekly_report_enabled', sa.Boolean(), nullable=True, server_default='1'))
    
    # Create index for preferred_language
    op.create_index(op.f('ix_user_preferred_language'), 'user', ['preferred_language'], unique=False)
    
    # Example of data migration within a schema migration
    # Set default theme based on existing users' preferences
    op.execute("""
        UPDATE user 
        SET theme = 'dark' 
        WHERE username IN ('johndoe', 'janesmith')
    """)


def downgrade():
    # Drop index first
    op.drop_index(op.f('ix_user_preferred_language'), table_name='user')
    
    # Drop columns
    op.drop_column('user', 'weekly_report_enabled')
    op.drop_column('user', 'notification_enabled')
    op.drop_column('user', 'theme')
    op.drop_column('user', 'preferred_language')