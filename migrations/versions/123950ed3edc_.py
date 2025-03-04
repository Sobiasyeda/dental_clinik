"""empty message

Revision ID: 123950ed3edc
Revises: 664e1496d614
Create Date: 2024-10-19 13:43:55.568632

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '123950ed3edc'
down_revision = '664e1496d614'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('crowns')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('crowns',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('crown_surface', mysql.VARCHAR(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_0900_ai_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    # ### end Alembic commands ###
